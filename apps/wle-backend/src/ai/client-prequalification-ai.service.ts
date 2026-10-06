import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AssessmentEnginesService } from '../modules/assessment-engines/assessment-engines.service';
import { evaluateSafetyProgramCompliance } from '../modules/safety-program-compliance/safety-program-compliance.engine';
import type { SpceAssessmentResult } from '../modules/safety-program-compliance/safety-program-compliance.types';
import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import type {
  ContractorComplianceEngineInput,
  ContractorComplianceEngineOutput,
  SubmittedDocument,
} from '../pm-contractor-portal/contractor-compliance-engine.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ClientPrequalificationAiInput,
  ClientPrequalificationAiResult,
  ClientPrequalificationFinalStatus,
  ClientPrequalificationJson,
  PrequalificationDimensionScores,
  PrequalificationReportSection,
  ShareablePrequalificationReport,
} from './client-prequalification-ai.types';

const INSURANCE_PATTERN = /insurance|liability|coi|certificate of insurance/i;
const WCB_PATTERN = /wcb|wsib|workers.?comp|workers compensation|worksafe/i;

const DIMENSION_WEIGHTS = {
  hse_metrics: 0.25,
  insurance: 0.2,
  wcb_wsib: 0.2,
  safety_program: 0.35,
} as const;

@Injectable()
export class ClientPrequalificationAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complianceEngine: ContractorComplianceEngineService,
    private readonly assessmentEngines: AssessmentEnginesService,
  ) {}

  async evaluate(
    input: ClientPrequalificationAiInput,
  ): Promise<ClientPrequalificationAiResult> {
    const engineInput = await this.resolveInput(input);
    const engineOutput = this.complianceEngine.generate(engineInput);

    const companyId = engineInput.contractorCompanyId;
    const spceResult =
      companyId != null && companyId > 0
        ? evaluateSafetyProgramCompliance(
            await this.assessmentEngines.buildSpceInput(companyId),
          )
        : null;

    const spceBlocking = spceResult != null && spceResult.overallScore < 70;

    const dimension_scores = this.scoreDimensions(
      engineInput,
      engineOutput,
      spceResult?.overallScore,
    );
    const company_score = this.aggregateCompanyScore(dimension_scores);
    const missing_items = this.buildMissingItems(engineInput, engineOutput);
    const risk_flags = this.buildRiskFlags(
      engineInput,
      engineOutput,
      dimension_scores,
      spceResult,
    );
    const final_status = this.decideFinalStatus(
      company_score,
      dimension_scores,
      engineOutput,
      missing_items,
      spceBlocking,
    );
    const recommended_actions = this.buildRecommendedActions(
      engineOutput,
      missing_items,
      final_status,
    );

    const core: ClientPrequalificationJson = {
      company_score,
      risk_flags,
      missing_items,
      final_status,
    };

    const report = this.buildShareableReport(
      core,
      engineInput,
      dimension_scores,
      recommended_actions,
      spceResult?.overallScore,
    );

    return {
      ...core,
      prequalification_id: randomUUID(),
      source: 'rule_engine',
      model: null,
      dimension_scores,
      spce_score: spceResult?.overallScore,
      report,
      recommended_actions,
    };
  }

  private async resolveInput(
    input: ClientPrequalificationAiInput,
  ): Promise<ContractorComplianceEngineInput> {
    if (input.membershipId) {
      return this.complianceEngine.buildInputFromMembership(input.membershipId);
    }
    if (input.engineInput) {
      return input.engineInput;
    }
    if (input.contractorCompanyId) {
      return this.buildInputFromCompany(
        input.contractorCompanyId,
        input.primeCompanyId,
        input.projectId,
      );
    }
    throw new BadRequestException(
      'membershipId, contractorCompanyId, or engineInput is required',
    );
  }

  private async buildInputFromCompany(
    contractorCompanyId: number,
    primeCompanyId?: number,
    projectId?: number,
  ): Promise<ContractorComplianceEngineInput> {
    const company = await this.prisma.company.findUnique({
      where: { id: contractorCompanyId },
      select: { id: true, name: true },
    });
    if (!company) throw new NotFoundException('Contractor company not found');

    const membership = primeCompanyId
      ? await this.prisma.pmContractorPortalMembership.findFirst({
          where: {
            primeCompanyId,
            contractorCompanyId,
            active: true,
            ...(projectId ? { OR: [{ projectId }, { projectId: null }] } : {}),
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    if (membership) {
      return this.complianceEngine.buildInputFromMembership(membership.id);
    }

    const workerIds = (
      await this.prisma.worker.findMany({
        where: { companyId: contractorCompanyId },
        select: { id: true },
        take: 500,
      })
    ).map((w) => w.id);

    const now = new Date();
    const [profile, credentials, safetyEvents] = await Promise.all([
      this.prisma.pmCompanySafetyProfile.findUnique({
        where: { companyId: contractorCompanyId },
      }),
      this.prisma.credential.findMany({
        where: { workerId: { in: workerIds.length ? workerIds : [-1] } },
        take: 50,
      }),
      this.prisma.pmSafetyEvent.findMany({
        where: { companyId: contractorCompanyId, deletedAt: null },
        orderBy: { occurredAt: 'desc' },
        take: 30,
      }),
    ]);

    const submitted_documents: SubmittedDocument[] = [];
    if (profile?.status === 'published') {
      submitted_documents.push({
        type: 'policy',
        name: 'Company safety profile (published)',
        status: 'current',
      });
    }
    for (const c of credentials) {
      const isInsurance = INSURANCE_PATTERN.test(c.name);
      const isWcb = WCB_PATTERN.test(c.name);
      submitted_documents.push({
        type: isInsurance ? 'insurance' : isWcb ? 'wcb' : 'certification',
        name: c.name,
        status: c.expiresAt && c.expiresAt < now ? 'expired' : 'current',
        expires_at: c.expiresAt?.toISOString(),
      });
    }

    return {
      contractor_profile: { name: company.name },
      safety_stats: {
        TRIF: this.estimateTrif(safetyEvents.length, workerIds.length),
        recordable_rate: safetyEvents.length,
        year: now.getFullYear(),
      },
      certifications_and_programs:
        profile?.status === 'published'
          ? ['Published company safety profile']
          : [],
      submitted_documents,
      incident_history: safetyEvents.map((e) => ({
        date: e.occurredAt.toISOString(),
        type: e.eventType,
        severity: e.severity,
        summary: e.title,
      })),
      work_scope: {
        tasks: ['General contractor services'],
        risk_profile: profile?.corporateRiskLevel ?? 'medium',
      },
      primeCompanyId,
      contractorCompanyId,
      projectId,
    };
  }

  private estimateTrif(incidents: number, workers: number): number | undefined {
    if (!workers) return undefined;
    const hours = workers * 2000;
    if (!hours) return undefined;
    return Math.round((incidents / hours) * 200_000 * 10) / 10;
  }

  private scoreDimensions(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
    spceScore?: number,
  ): PrequalificationDimensionScores {
    const docs = input.submitted_documents ?? [];

    return {
      hse_metrics: this.scoreHse(input, engine),
      insurance: this.scoreDocumentCategory(
        docs,
        INSURANCE_PATTERN,
        'Commercial liability insurance',
      ),
      wcb_wsib: this.scoreDocumentCategory(
        docs,
        WCB_PATTERN,
        'Workers compensation / WCB clearance',
      ),
      safety_program: this.scoreSafetyProgram(engine, spceScore),
    };
  }

  private scoreHse(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
  ): number {
    let score = 78;

    const perf = engine.performance_assessment;
    if (perf.overall_performance === 'strong') score += 14;
    else if (perf.overall_performance === 'concerning') score -= 28;
    else if (perf.overall_performance === 'acceptable') score += 4;

    if (perf.incident_trend === 'improving') score += 6;
    if (perf.incident_trend === 'deteriorating') score -= 14;

    const trif = input.safety_stats?.TRIF;
    const ltif = input.safety_stats?.LTIF;
    if (trif != null) {
      if (trif <= 1) score += 8;
      else if (trif > 3) score -= 22;
      else if (trif > 1.5) score -= 10;
    } else {
      score -= 12;
    }
    if (ltif != null && ltif > 1.5) score -= 12;

    return this.clamp(score);
  }

  private scoreDocumentCategory(
    docs: SubmittedDocument[],
    pattern: RegExp,
    requirementLabel: string,
    engineGap?: boolean,
  ): number {
    const matches = docs.filter((d) =>
      pattern.test(`${d.type} ${d.name ?? ''}`),
    );
    if (!matches.length) return engineGap ? 15 : 0;

    let score = 70;
    const current = matches.filter((d) => d.status === 'current');
    const expired = matches.filter((d) => d.status === 'expired');

    if (current.length) score += 22;
    if (expired.length) score -= 40;

    for (const doc of matches) {
      if (!doc.expires_at) {
        score -= 8;
        continue;
      }
      const days = Math.ceil(
        (new Date(doc.expires_at).getTime() - Date.now()) / 86_400_000,
      );
      if (days < 0) score -= 25;
      else if (days <= 30) score -= 10;
      else score += 6;
    }

    if (!matches.length && requirementLabel) {
      return 0;
    }

    return this.clamp(score);
  }

  private scoreSafetyProgram(
    engine: ContractorComplianceEngineOutput,
    spceScore?: number,
  ): number {
    if (spceScore != null) {
      let score = spceScore;
      const programGaps = engine.compliance_gaps.filter(
        (g) =>
          g.category === 'policy' ||
          g.category === 'certification' ||
          g.category === 'procedure',
      );
      score -= programGaps.filter((g) => g.priority === 'high').length * 8;
      score -= programGaps.filter((g) => g.status === 'missing').length * 5;
      return this.clamp(score);
    }

    let score = 55;
    const programGaps = engine.compliance_gaps.filter(
      (g) =>
        g.category === 'policy' ||
        g.category === 'certification' ||
        g.category === 'procedure',
    );
    score -= programGaps.filter((g) => g.status === 'missing').length * 12;
    score -= programGaps.filter((g) => g.status === 'expired').length * 10;
    if (engine.compliance_gaps.every((g) => g.status !== 'missing'))
      score += 20;
    return this.clamp(score);
  }

  private aggregateCompanyScore(
    dimensions: PrequalificationDimensionScores,
  ): number {
    const raw =
      dimensions.hse_metrics * DIMENSION_WEIGHTS.hse_metrics +
      dimensions.insurance * DIMENSION_WEIGHTS.insurance +
      dimensions.wcb_wsib * DIMENSION_WEIGHTS.wcb_wsib +
      dimensions.safety_program * DIMENSION_WEIGHTS.safety_program;
    return this.clamp(Math.round(raw));
  }

  private buildMissingItems(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
  ): string[] {
    const items = new Set(
      engine.compliance_gaps
        .filter((g) => g.status === 'missing')
        .map((g) => g.requirement),
    );

    const docs = input.submitted_documents ?? [];
    if (
      !docs.some((d) => INSURANCE_PATTERN.test(`${d.type} ${d.name ?? ''}`))
    ) {
      items.add('Commercial liability insurance (COI)');
    }
    if (!docs.some((d) => WCB_PATTERN.test(`${d.type} ${d.name ?? ''}`))) {
      items.add('Workers compensation / WCB or WSIB clearance');
    }
    if (
      !docs.some((d) =>
        /safety policy|hse policy|policy/i.test(`${d.type} ${d.name ?? ''}`),
      )
    ) {
      items.add('Corporate safety policy');
    }
    if (
      !docs.some((d) =>
        /hse program|cor|iso 45001|safety program/i.test(
          `${d.type} ${d.name ?? ''}`,
        ),
      )
    ) {
      const hasProgramCert = (input.certifications_and_programs ?? []).some(
        (c) => /cor|iso|program/i.test(c),
      );
      if (!hasProgramCert) items.add('HSE management program documentation');
    }

    return [...items];
  }

  private buildRiskFlags(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
    dimensions: PrequalificationDimensionScores,
    spceResult?: SpceAssessmentResult | null,
  ): string[] {
    const flags = new Set<string>();

    if (dimensions.insurance < 50)
      flags.add('Insurance documentation missing or expired');
    if (dimensions.wcb_wsib < 50)
      flags.add('WCB/WSIB clearance missing or expired');
    if (dimensions.hse_metrics < 55)
      flags.add('HSE lagging indicators or incident trend concerning');
    if (dimensions.safety_program < 60)
      flags.add('Safety program documentation below client threshold');

    if (spceResult && spceResult.overallScore < 70) {
      flags.add(
        `SPCE score ${spceResult.overallScore} blocks prequalification`,
      );
    }

    for (const gap of engine.compliance_gaps.filter(
      (g) => g.priority === 'high',
    )) {
      flags.add(`${gap.status.toUpperCase()}: ${gap.requirement}`);
    }

    if (engine.performance_assessment.incident_trend === 'deteriorating') {
      flags.add('Deteriorating incident trend');
    }

    const trif = input.safety_stats?.TRIF;
    if (trif != null && trif > 3)
      flags.add(`TRIF ${trif} exceeds typical client threshold`);

    return [...flags].slice(0, 15);
  }

  private decideFinalStatus(
    company_score: number,
    dimensions: PrequalificationDimensionScores,
    engine: ContractorComplianceEngineOutput,
    missing_items: string[],
    spceBlocking?: boolean,
  ): ClientPrequalificationFinalStatus {
    const criticalMissing = missing_items.some(
      (m) =>
        INSURANCE_PATTERN.test(m) ||
        WCB_PATTERN.test(m) ||
        m.toLowerCase().includes('wcb') ||
        m.toLowerCase().includes('wsib'),
    );

    if (
      criticalMissing ||
      dimensions.insurance < 40 ||
      dimensions.wcb_wsib < 40 ||
      spceBlocking ||
      engine.approval_status === 'reject' ||
      company_score < 45
    ) {
      return 'Rejected';
    }

    if (
      company_score < 75 ||
      engine.approval_status === 'conditional' ||
      missing_items.length > 0 ||
      dimensions.insurance < 70 ||
      dimensions.wcb_wsib < 70 ||
      dimensions.safety_program < 70 ||
      engine.compliance_gaps.some((g) => g.status === 'expired')
    ) {
      return 'Conditional';
    }

    return 'Approved';
  }

  private buildRecommendedActions(
    engine: ContractorComplianceEngineOutput,
    missing_items: string[],
    final_status: ClientPrequalificationFinalStatus,
  ): string[] {
    const actions = new Set<string>();

    for (const item of missing_items.slice(0, 6)) {
      actions.add(`Upload or renew: ${item}`);
    }
    for (const gap of engine.compliance_gaps.slice(0, 4)) {
      actions.add(gap.remediation);
    }
    if (final_status === 'Conditional') {
      actions.add(
        'Issue conditional prequalification letter with documented hold points.',
      );
    }
    if (final_status === 'Rejected') {
      actions.add(
        'Do not award work until all blocking items are closed and re-verified.',
      );
    }
    if (final_status === 'Approved') {
      actions.add(
        'Schedule annual prequalification refresh and quarterly document checks.',
      );
    }

    return [...actions].slice(0, 10);
  }

  private buildShareableReport(
    core: ClientPrequalificationJson,
    input: ContractorComplianceEngineInput,
    dimensions: PrequalificationDimensionScores,
    recommended_actions: string[],
    spceScore?: number,
  ): ShareablePrequalificationReport {
    const report_id = randomUUID();
    const company_name = input.contractor_profile.name ?? 'Contractor';
    const generated_at = new Date().toISOString();

    const section = (
      title: string,
      score: number,
      findings: string[],
    ): PrequalificationReportSection => ({
      title,
      score,
      status: score >= 75 ? 'pass' : score >= 50 ? 'warning' : 'fail',
      findings,
    });

    const trif = input.safety_stats?.TRIF;
    const ltif = input.safety_stats?.LTIF;

    const sections = {
      hse_metrics: section('HSE metrics', dimensions.hse_metrics, [
        trif != null ? `TRIF: ${trif}` : 'TRIF not reported',
        ltif != null ? `LTIF: ${ltif}` : 'LTIF not reported',
        `Recordable events on file: ${input.incident_history?.length ?? 0}`,
      ]),
      insurance: section('Insurance', dimensions.insurance, [
        core.missing_items.some((m) => INSURANCE_PATTERN.test(m))
          ? 'Certificate of insurance not on file'
          : 'Insurance documentation submitted',
      ]),
      wcb_wsib: section('WCB / WSIB', dimensions.wcb_wsib, [
        core.missing_items.some(
          (m) => WCB_PATTERN.test(m) || /wcb|wsib/i.test(m),
        )
          ? 'WCB/WSIB clearance not on file'
          : 'Workers compensation clearance submitted',
      ]),
      safety_program: section(
        'Safety program documents',
        dimensions.safety_program,
        [
          spceScore != null
            ? `SPCE program score: ${spceScore}/100`
            : 'SPCE evaluation from policy library',
          `Safety profile: ${
            (input.certifications_and_programs ?? []).join(', ') ||
            'Not published'
          }`,
        ],
      ),
    };

    const executive_summary = [
      `${company_name} prequalification score ${core.company_score}/100 — ${core.final_status}.`,
      `HSE ${dimensions.hse_metrics}, Insurance ${dimensions.insurance}, WCB/WSIB ${dimensions.wcb_wsib}, Program ${dimensions.safety_program}.`,
      core.risk_flags.length
        ? `Key risks: ${core.risk_flags.slice(0, 3).join('; ')}.`
        : 'No critical risk flags identified.',
    ].join(' ');

    const markdown = [
      `# Client Prequalification Report`,
      ``,
      `**Company:** ${company_name}`,
      `**Score:** ${core.company_score}/100`,
      `**Status:** ${core.final_status}`,
      `**Generated:** ${generated_at.slice(0, 10)}`,
      ``,
      `## Executive summary`,
      executive_summary,
      ``,
      `## HSE metrics (${dimensions.hse_metrics}/100)`,
      ...sections.hse_metrics.findings.map((f) => `- ${f}`),
      ``,
      `## Insurance (${dimensions.insurance}/100)`,
      ...sections.insurance.findings.map((f) => `- ${f}`),
      ``,
      `## WCB / WSIB (${dimensions.wcb_wsib}/100)`,
      ...sections.wcb_wsib.findings.map((f) => `- ${f}`),
      ``,
      `## Safety program (${dimensions.safety_program}/100)`,
      ...sections.safety_program.findings.map((f) => `- ${f}`),
      ``,
      core.missing_items.length
        ? `## Missing items\n${core.missing_items
            .map((m) => `- ${m}`)
            .join('\n')}\n`
        : '',
      core.risk_flags.length
        ? `## Risk flags\n${core.risk_flags.map((r) => `- ${r}`).join('\n')}\n`
        : '',
      `## Recommended actions`,
      ...recommended_actions.map((a) => `- ${a}`),
      ``,
      `---`,
      `Report ID: ${report_id}`,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      report_id,
      company_name,
      generated_at,
      company_score: core.company_score,
      final_status: core.final_status,
      executive_summary,
      sections,
      risk_flags: core.risk_flags,
      missing_items: core.missing_items,
      markdown,
      share_path: `/pm/contractors/prequalification/${report_id}`,
    };
  }

  private clamp(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
