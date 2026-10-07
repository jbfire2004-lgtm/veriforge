import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';
import type {
  AuditCapaItem,
  AuditFinding,
  AuditInspectionCapaEngineInput,
  AuditInspectionCapaEngineOutput,
  AuditTrend,
  InspectionResponse,
} from './audit-inspection-capa-engine.types';

const DEFAULT_ORG_STANDARDS = [
  'Life-saving rules — work with a valid permit when required',
  'Life-saving rules — verify zero energy before work',
  'Life-saving rules — protect yourself against a fall when working at height',
  'Critical control — barricade line of fire',
  'Critical control — confined space entry procedure',
];

const SIF_KEYWORDS = [
  'fall',
  'height',
  'confined',
  'energized',
  'lockout',
  'loto',
  'crane',
  'rigging',
  'line of fire',
  'excavation',
  'trench',
  'pressure',
  'crush',
];

@Injectable()
export class AuditInspectionCapaEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deficiencyScoring: DeficiencyScoringEngine,
  ) {}

  generate(
    input: AuditInspectionCapaEngineInput,
  ): AuditInspectionCapaEngineOutput {
    const items = this.normalizeItems(input);
    const findings = this.buildFindings(input, items);
    const capa_list = this.buildCapa(findings, input);
    const trends = this.analyzeTrends(findings, input.previous_audits ?? []);
    const executive_summary = this.buildExecutiveSummary(
      input,
      findings,
      capa_list,
      trends,
    );
    const field_brief = this.buildFieldBrief(findings, capa_list);

    return { findings, capa_list, executive_summary, field_brief, trends };
  }

  async buildInputFromInspection(
    inspectionId: string,
  ): Promise<AuditInspectionCapaEngineInput> {
    const inspection = await this.prisma.pmInspection.findFirst({
      where: { id: inspectionId, deletedAt: null },
      include: {
        template: true,
        attachments: { select: { fileName: true, annotationJson: true } },
        deficiencies: { select: { title: true, itemId: true } },
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const items = (inspection.template.items as ChecklistItemDef[]) ?? [];
    const answers = (inspection.answers as Record<string, unknown>) ?? {};

    const responses: InspectionResponse[] = items.map((item) => {
      const answer = answers[item.id];
      const status = this.answerToStatus(item, answer);
      const photoSummaries = inspection.attachments
        .filter((a) => {
          const ann = a.annotationJson as { itemId?: string } | null;
          return ann?.itemId === item.id;
        })
        .map((a) => a.fileName ?? 'Photo evidence');

      return {
        item_id: item.id,
        status,
        comments:
          typeof answer === 'object' &&
          answer &&
          'comment' in (answer as object)
            ? String((answer as { comment?: string }).comment)
            : typeof answer === 'string' && item.type === 'text'
            ? answer
            : undefined,
        photos_summaries: photoSummaries.length ? photoSummaries : undefined,
      };
    });

    const previous = await this.prisma.pmInspection.findMany({
      where: {
        projectId: inspection.projectId,
        templateId: inspection.templateId,
        deletedAt: null,
        id: { not: inspectionId },
        submittedAt: { not: null },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      select: { submittedAt: true, answers: true, passed: true, title: true },
    });

    const projectProfile = await this.prisma.pmProjectSafetyProfile.findFirst({
      where: { projectId: inspection.projectId },
    });

    const companyProfile = await this.prisma.pmCompanySafetyProfile.findFirst({
      where: { companyId: inspection.companyId },
    });

    const org_standards = [
      ...DEFAULT_ORG_STANDARDS,
      ...((companyProfile?.policiesJson as string[]) ?? []).slice(0, 5),
    ];

    return {
      checklist_template: {
        items: items.map((i) => ({
          id: i.id,
          label: i.label,
          category: inspection.template.category,
          type: i.type,
          required: i.required,
          weight: i.weight,
          critical: i.critical,
          energyType: i.energyType,
        })),
        categories: [inspection.template.category],
        scoring_rules:
          (inspection.template.scoringRules as Record<string, unknown>) ?? {},
      },
      responses,
      site_risk_profile: projectProfile?.riskLevel ?? 'medium',
      previous_audits: previous.map((p) => ({
        date: p.submittedAt?.toISOString(),
        failed_items: this.failedItemIdsFromAnswers(
          items,
          (p.answers as Record<string, unknown>) ?? {},
        ),
        summary: p.title ?? (p.passed ? 'Passed' : 'Failed'),
      })),
      org_standards,
      inspectionId,
      projectId: inspection.projectId,
      companyId: inspection.companyId,
    };
  }

  private normalizeItems(
    input: AuditInspectionCapaEngineInput,
  ): Map<string, ChecklistItemDef & { category?: string }> {
    const map = new Map<string, ChecklistItemDef & { category?: string }>();
    for (const item of input.checklist_template.items ?? []) {
      map.set(item.id, {
        id: item.id,
        label: item.label,
        type: (item.type as ChecklistItemDef['type']) ?? 'pass_fail',
        required: item.required,
        weight: item.weight,
        critical: item.critical,
        energyType: item.energyType,
        category: item.category,
      });
    }
    return map;
  }

  private buildFindings(
    input: AuditInspectionCapaEngineInput,
    items: Map<string, ChecklistItemDef & { category?: string }>,
  ): AuditFinding[] {
    const findings: AuditFinding[] = [];
    const standards = input.org_standards?.length
      ? input.org_standards
      : DEFAULT_ORG_STANDARDS;
    const siteRisk = (input.site_risk_profile ?? 'medium').toLowerCase();

    for (const response of input.responses) {
      if (!this.isNonCompliant(response)) continue;

      const item = items.get(response.item_id);
      const label = item?.label ?? response.item_id;
      const category = item?.category ?? 'general';
      const description = [
        `${label} — ${response.status}`,
        response.comments ? `Comment: ${response.comments}` : null,
        response.photos_summaries?.length
          ? `Evidence: ${response.photos_summaries.join('; ')}`
          : null,
      ]
        .filter(Boolean)
        .join('. ');

      const related_standard = this.matchStandard(label, standards);
      const likelihood = this.likelihoodFor(response, item, siteRisk);
      const consequence = this.consequenceFor(item, siteRisk);
      const score = likelihood * consequence;
      const level = this.riskLevel(score);
      const sif_relevance = this.isSifRelevant(item, label) ? 'yes' : 'no';

      findings.push({
        item_id: response.item_id,
        description,
        related_standard,
        risk_rating: { likelihood, consequence, score, level },
        sif_relevance,
        category,
      });
    }

    return findings.sort((a, b) => b.risk_rating.score - a.risk_rating.score);
  }

  private buildCapa(
    findings: AuditFinding[],
    input: AuditInspectionCapaEngineInput,
  ): AuditCapaItem[] {
    const systemicCategories = this.systemicCategories(findings);

    return findings.map((f) => {
      const severity =
        f.risk_rating.level === 'critical'
          ? 'critical'
          : f.risk_rating.level === 'high'
          ? 'high'
          : f.risk_rating.level === 'medium'
          ? 'medium'
          : 'low';

      const due_date_priority: AuditCapaItem['due_date_priority'] =
        severity === 'critical' || f.sif_relevance === 'yes'
          ? 'high'
          : severity === 'high'
          ? 'medium'
          : 'low';

      const preventive =
        systemicCategories.has(f.category ?? '') ||
        findings.filter((x) => x.category === f.category).length > 1
          ? `Review SMS procedure for ${
              f.category ?? 'this hazard class'
            } and verify controls across site.`
          : undefined;

      return {
        finding_ref: f.item_id,
        corrective_action: `Correct ${
          f.description.split(' — ')[0]
        } and verify closure with evidence.`,
        preventive_action: preventive,
        responsible_role: this.ownerFor(f),
        due_date_priority,
      };
    });
  }

  private analyzeTrends(
    findings: AuditFinding[],
    previous: AuditInspectionCapaEngineInput['previous_audits'],
  ): AuditTrend[] {
    if (!previous?.length) return [];

    const currentIds = new Set(findings.map((f) => f.item_id));
    const counts = new Map<string, number>();

    for (const audit of previous) {
      for (const itemId of audit.failed_items ?? []) {
        if (currentIds.has(itemId)) {
          counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
        }
      }
    }

    const trends: AuditTrend[] = [];
    for (const [itemId, count] of counts) {
      const finding = findings.find((f) => f.item_id === itemId);
      trends.push({
        issue: finding?.description.split(' — ')[0] ?? itemId,
        recurrence_count: count + 1,
        note: `Recurring on ${count + 1} of ${
          previous.length + 1
        } recent audits — escalate CAPA verification.`,
      });
    }

    return trends.sort((a, b) => b.recurrence_count - a.recurrence_count);
  }

  private buildExecutiveSummary(
    input: AuditInspectionCapaEngineInput,
    findings: AuditFinding[],
    capa: AuditCapaItem[],
    trends: AuditTrend[],
  ): string[] {
    const total = input.responses.length;
    const failed = input.responses.filter((r) => this.isNonCompliant(r)).length;
    const sif = findings.filter((f) => f.sif_relevance === 'yes').length;
    const critical = findings.filter(
      (f) => f.risk_rating.level === 'critical',
    ).length;

    const bullets = [
      `Audit completed: ${failed} of ${total} item(s) non-compliant or concerning.`,
      `Site risk profile: ${input.site_risk_profile ?? 'not specified'}.`,
      `${findings.length} finding(s) generated; ${critical} critical, ${sif} with SIF relevance.`,
      `${capa.length} corrective action(s) proposed; ${
        capa.filter((c) => c.due_date_priority === 'high').length
      } high priority.`,
    ];

    if (trends.length) {
      bullets.push(
        `Recurring issues: ${trends
          .slice(0, 2)
          .map((t) => t.issue)
          .join('; ')}.`,
      );
    }

    if (findings[0]) {
      bullets.push(`Top finding: ${findings[0].description.slice(0, 120)}.`);
    }

    bullets.push(
      'Supervisor review and evidence upload required before close-out.',
    );

    return bullets.slice(0, 10);
  }

  private buildFieldBrief(
    findings: AuditFinding[],
    capa: AuditCapaItem[],
  ): string[] {
    const brief = [
      findings.length
        ? `Today's audit flagged ${findings.length} item(s) — discuss controls before restart.`
        : 'No significant findings — confirm standards still understood by crew.',
    ];

    for (const f of findings
      .filter((x) => x.sif_relevance === 'yes')
      .slice(0, 2)) {
      brief.push(`SIF focus: ${f.description.split(' — ')[0]}.`);
    }

    for (const c of capa
      .filter((x) => x.due_date_priority === 'high')
      .slice(0, 2)) {
      brief.push(`Action: ${c.corrective_action}`);
    }

    brief.push('Verify permits, PPE, and barricades match the work plan.');

    return brief.slice(0, 5);
  }

  private isNonCompliant(response: InspectionResponse): boolean {
    const s = response.status.toLowerCase();
    return s === 'fail' || s === 'concern' || s === 'no' || s === 'false';
  }

  private answerToStatus(
    item: ChecklistItemDef,
    answer: unknown,
  ): InspectionResponse['status'] {
    if (item.type === 'pass_fail') {
      if (answer === false || answer === 'fail' || answer === 'no')
        return 'fail';
      if (answer === true || answer === 'pass' || answer === 'yes')
        return 'pass';
      return 'concern';
    }
    if (
      item.type === 'numeric' &&
      typeof answer === 'number' &&
      item.failValues?.includes(answer)
    ) {
      return 'fail';
    }
    return 'pass';
  }

  private failedItemIdsFromAnswers(
    items: ChecklistItemDef[],
    answers: Record<string, unknown>,
  ): string[] {
    return items
      .filter((item) => {
        const status = this.answerToStatus(item, answers[item.id]);
        return this.isNonCompliant({ item_id: item.id, status });
      })
      .map((i) => i.id);
  }

  private matchStandard(label: string, standards: string[]): string {
    const lower = label.toLowerCase();
    for (const std of standards) {
      const tokens = std
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 4);
      if (tokens.some((t) => lower.includes(t))) return std;
    }
    return standards[0] ?? 'Organizational safety standard';
  }

  private likelihoodFor(
    response: InspectionResponse,
    item: (ChecklistItemDef & { category?: string }) | undefined,
    siteRisk: string,
  ): number {
    let l = response.status === 'fail' ? 4 : 3;
    if (item?.required) l += 1;
    if (siteRisk === 'high' || siteRisk === 'critical') l += 1;
    return Math.min(l, 5);
  }

  private consequenceFor(
    item: (ChecklistItemDef & { category?: string }) | undefined,
    siteRisk: string,
  ): number {
    if (!item) return 3;
    const templateCategory = item.category ?? 'general';
    const severity = this.deficiencyScoring.severityForFailedItem(
      item,
      templateCategory,
    );
    const base =
      severity === 'critical'
        ? 5
        : severity === 'high'
        ? 4
        : severity === 'medium'
        ? 3
        : 2;
    if (siteRisk === 'critical') return Math.min(base + 1, 5);
    return base;
  }

  private riskLevel(score: number): AuditFinding['risk_rating']['level'] {
    if (score >= 20) return 'critical';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  private isSifRelevant(
    item: (ChecklistItemDef & { category?: string }) | undefined,
    label: string,
  ): boolean {
    if (item?.critical || item?.energyType) return true;
    const text = `${label} ${item?.energyType ?? ''}`.toLowerCase();
    return SIF_KEYWORDS.some((k) => text.includes(k));
  }

  private systemicCategories(findings: AuditFinding[]): Set<string> {
    const counts = new Map<string, number>();
    for (const f of findings) {
      const c = f.category ?? 'general';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return new Set(
      [...counts.entries()].filter(([, n]) => n >= 2).map(([c]) => c),
    );
  }

  private ownerFor(finding: AuditFinding): string {
    if (finding.sif_relevance === 'yes') return 'Site superintendent';
    if (
      finding.risk_rating.level === 'critical' ||
      finding.risk_rating.level === 'high'
    ) {
      return 'HSE coordinator';
    }
    if (finding.category === 'HOUSEKEEPING') return 'Supervisor';
    return 'Assigned owner';
  }
}
