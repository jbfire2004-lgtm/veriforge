import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  MatrixRequirement,
  PrioritizedTrainingPlan,
  ProjectScope,
  TrainingCompetencyEngineInput,
  TrainingCompetencyEngineOutput,
  TrainingGap,
  TrainingPlanItem,
  TrainingRecord,
} from './training-competency-engine.types';

const SIF_COURSE_KEYWORDS = [
  'fall protection',
  'working at heights',
  'confined space',
  'rigging',
  'crane',
  'lockout',
  'loto',
  'energized',
  'excavation',
  'trench',
  'scaffold',
  'line of fire',
];

const LEGAL_COURSE_KEYWORDS = [
  'whmis',
  'tdg',
  'orientation',
  'first aid',
  'cpr',
  'ohs',
  'h2s',
  'ground disturbance',
];

const TASK_COURSE_MAP: Record<string, string[]> = {
  height: ['Working at Heights', 'Fall Protection'],
  scaffold: ['Scaffold User', 'Fall Protection'],
  'confined space': ['Confined Space Entry'],
  excavation: ['Ground Disturbance', 'Excavation Safety'],
  lifting: ['Rigging and Hoisting', 'Crane Operator'],
  rigging: ['Rigging and Hoisting'],
  crane: ['Crane Operator', 'Rigging and Hoisting'],
  energized: ['Electrical Safety', 'LOTO'],
  electrical: ['Electrical Safety', 'LOTO'],
  hot_work: ['Fire Watch', 'Hot Work'],
  welding: ['Hot Work', 'Fire Watch'],
  hazmat: ['WHMIS', 'Spill Response'],
  line_of_fire: ['Line of Fire Awareness'],
  'line of fire': ['Line of Fire Awareness'],
};

@Injectable()
export class TrainingCompetencyEngineService {
  constructor(private readonly prisma: PrismaService) {}

  generate(
    input: TrainingCompetencyEngineInput,
  ): TrainingCompetencyEngineOutput {
    const required = this.collectRequiredCourses(input);
    const gaps = this.analyzeGaps(required, input);
    const prioritized_training_plan = this.buildPlan(gaps, input);
    const field_summary = this.buildFieldSummary(
      input,
      gaps,
      prioritized_training_plan,
    );

    return { gaps, prioritized_training_plan, field_summary };
  }

  async buildInputFromWorker(
    workerId: number,
    projectId?: number,
    projectScope?: ProjectScope,
  ): Promise<TrainingCompetencyEngineInput> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: { include: { certification: true, provider: true } },
        credentials: { include: { certification: true } },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const roleType = 'worker' as const;
    const matrix = worker.companyId
      ? await this.prisma.pmCompanyTrainingMatrix.findMany({
          where: {
            companyId: worker.companyId,
            roleType,
            active: true,
            status: 'published',
          },
        })
      : [];

    const incidents = await this.prisma.pmSafetyEventInjury.findMany({
      where: { workerId },
      include: {
        event: { select: { occurredAt: true, eventType: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const projectProfile = projectId
      ? await this.prisma.pmProjectSafetyProfile.findFirst({
          where: { projectId },
        })
      : null;

    const now = new Date();
    const records: TrainingRecord[] = [
      ...worker.trainingRecords.map((r) => ({
        course: r.certification.name,
        date: (r.completedAt ?? r.issuedAt).toISOString().slice(0, 10),
        expiry: r.expiresAt?.toISOString().slice(0, 10),
        provider: r.provider?.name,
        status: r.expiresAt && r.expiresAt < now ? 'expired' : 'valid',
      })),
      ...worker.credentials.map((c) => ({
        course: c.certification?.name ?? c.name,
        date: c.issuedAt.toISOString().slice(0, 10),
        expiry: c.expiresAt?.toISOString().slice(0, 10),
        status: c.expiresAt && c.expiresAt < now ? 'expired' : 'valid',
      })),
    ];

    const required_training_matrix: MatrixRequirement[] = matrix.map((m) => ({
      role: m.roleType,
      task: m.category,
      required_courses: [m.trainingName],
      frequency: `${m.expiresInDays} days`,
    }));

    const scope: ProjectScope =
      projectScope ??
      ({
        tasks: projectProfile?.projectType
          ? [projectProfile.projectType]
          : ['General site work'],
        critical_risks:
          (projectProfile?.requiredJhaTypes as string[] | undefined) ?? [],
        equipment:
          (projectProfile?.requiredEquipmentCerts as string[] | undefined) ??
          [],
      } as ProjectScope);

    const client_additional_training_requirements = [
      ...((projectProfile?.requiredTraining as string[]) ?? []),
    ];

    return {
      worker_profile: {
        role: roleType,
        experience_years: undefined,
        certifications: worker.credentials.map(
          (c) => c.certification?.name ?? c.name,
        ),
        trade: undefined,
        past_incidents: incidents.map((i) => ({
          date: i.event.occurredAt.toISOString().slice(0, 10),
          type: i.event.eventType,
          summary: i.event.title,
        })),
      },
      current_training_records: records,
      required_training_matrix,
      project_scope: scope,
      client_additional_training_requirements,
      workerId,
      companyId: worker.companyId ?? undefined,
      projectId,
    };
  }

  private collectRequiredCourses(input: TrainingCompetencyEngineInput): Array<{
    course: string;
    task?: string;
    risk?: string;
    source: string;
  }> {
    const required: Array<{
      course: string;
      task?: string;
      risk?: string;
      source: string;
    }> = [];
    const seen = new Set<string>();

    const add = (
      course: string,
      meta: { task?: string; risk?: string; source: string },
    ) => {
      const key = course.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      required.push({ course, ...meta });
    };

    for (const row of input.required_training_matrix ?? []) {
      for (const course of row.required_courses) {
        add(course, { task: row.task, source: `matrix:${row.role ?? 'role'}` });
      }
    }

    for (const task of input.project_scope.tasks ?? []) {
      for (const [key, courses] of Object.entries(TASK_COURSE_MAP)) {
        if (task.toLowerCase().includes(key)) {
          for (const course of courses) add(course, { task, source: 'task' });
        }
      }
    }

    for (const risk of input.project_scope.critical_risks ?? []) {
      const riskKey = risk.toLowerCase().replace(/-/g, ' ');
      const mapped =
        TASK_COURSE_MAP[riskKey] ?? TASK_COURSE_MAP[risk.toLowerCase()];
      if (mapped) {
        for (const course of mapped)
          add(course, { risk, source: 'critical_risk' });
      } else {
        add(`${risk} awareness`, { risk, source: 'critical_risk' });
      }
    }

    for (const equip of input.project_scope.equipment ?? []) {
      add(`${equip} operation/competency`, {
        task: equip,
        source: 'equipment',
      });
    }

    for (const client of input.client_additional_training_requirements ?? []) {
      add(client, { source: 'client' });
    }

    if (!required.length) {
      add('Site orientation', { source: 'baseline' });
      add('WHMIS', { source: 'baseline' });
    }

    return required;
  }

  private analyzeGaps(
    required: Array<{
      course: string;
      task?: string;
      risk?: string;
      source: string;
    }>,
    input: TrainingCompetencyEngineInput,
  ): TrainingGap[] {
    const held = input.current_training_records ?? [];
    const gaps: TrainingGap[] = [];

    for (const req of required) {
      const match = this.findRecord(req.course, held);
      if (!match || match.status === 'expired') {
        const drivers: string[] = [];
        let priority_score = 10;

        if (this.isSifCourse(req.course) || req.risk) {
          drivers.push('SIF relevance');
          priority_score += 40;
        }
        if (this.isLegalCourse(req.course) || req.source === 'baseline') {
          drivers.push('Legal/compliance');
          priority_score += 30;
        }
        if (req.source === 'client') {
          drivers.push('Client requirement');
          priority_score += 25;
        }
        if (req.source === 'critical_risk' || req.source === 'task') {
          drivers.push('Project scope');
          priority_score += 20;
        }
        if (
          (input.worker_profile.past_incidents?.length ?? 0) > 0 &&
          req.risk
        ) {
          drivers.push('Incident history');
          priority_score += 15;
        }

        const priority_tier = this.tierFromScore(priority_score, input);

        gaps.push({
          course: req.course,
          linked_task: req.task,
          linked_risk: req.risk,
          status: match?.status === 'expired' ? 'expired' : 'missing',
          priority_score,
          priority_tier,
          drivers,
          remediation:
            match?.status === 'expired'
              ? `Renew ${req.course} before assignment to ${
                  req.task ?? req.risk ?? 'planned work'
                }.`
              : `Complete ${req.course} before assignment to ${
                  req.task ?? req.risk ?? 'planned work'
                }.`,
        });
      }
    }

    return gaps.sort((a, b) => b.priority_score - a.priority_score);
  }

  private findRecord(
    course: string,
    held: TrainingRecord[],
  ): TrainingRecord | undefined {
    const needle = course.toLowerCase();
    return held.find((h) => {
      const hay = h.course.toLowerCase();
      return (
        hay.includes(needle) ||
        needle.includes(hay) ||
        this.tokenOverlap(hay, needle) >= 0.5
      );
    });
  }

  private tokenOverlap(a: string, b: string): number {
    const ta = new Set(a.split(/\s+/).filter((t) => t.length > 3));
    const tb = new Set(b.split(/\s+/).filter((t) => t.length > 3));
    if (!ta.size || !tb.size) return 0;
    let hit = 0;
    for (const t of ta) if (tb.has(t)) hit++;
    return hit / Math.max(ta.size, tb.size);
  }

  private isSifCourse(course: string): boolean {
    const c = course.toLowerCase();
    return SIF_COURSE_KEYWORDS.some((k) => c.includes(k));
  }

  private isLegalCourse(course: string): boolean {
    const c = course.toLowerCase();
    return LEGAL_COURSE_KEYWORDS.some((k) => c.includes(k));
  }

  private tierFromScore(
    score: number,
    input: TrainingCompetencyEngineInput,
  ): TrainingGap['priority_tier'] {
    if (score >= 55) return 'immediate';
    if (score >= 30) return 'short_term';
    if ((input.worker_profile.experience_years ?? 5) < 2) return 'development';
    return 'short_term';
  }

  private buildPlan(
    gaps: TrainingGap[],
    input: TrainingCompetencyEngineInput,
  ): PrioritizedTrainingPlan {
    const immediate_required_training: TrainingPlanItem[] = gaps
      .filter((g) => g.priority_tier === 'immediate')
      .map((g) => this.toPlanItem(g, 'Before work starts'));

    const short_term_training: TrainingPlanItem[] = gaps
      .filter((g) => g.priority_tier === 'short_term')
      .map((g) => this.toPlanItem(g, '30–90 days'));

    const development_training: TrainingPlanItem[] = [
      ...gaps
        .filter((g) => g.priority_tier === 'development')
        .map((g) => this.toPlanItem(g, '90+ days')),
      ...this.suggestDevelopment(input),
    ];

    return {
      immediate_required_training: immediate_required_training.slice(0, 10),
      short_term_training: short_term_training.slice(0, 10),
      development_training: development_training.slice(0, 8),
    };
  }

  private toPlanItem(gap: TrainingGap, due_window: string): TrainingPlanItem {
    return {
      course: gap.course,
      reason: gap.drivers.join('; ') || gap.remediation,
      due_window,
      priority:
        gap.priority_score >= 55
          ? 'high'
          : gap.priority_score >= 30
          ? 'medium'
          : 'low',
    };
  }

  private suggestDevelopment(
    input: TrainingCompetencyEngineInput,
  ): TrainingPlanItem[] {
    const items: TrainingPlanItem[] = [];
    const exp = input.worker_profile.experience_years ?? 0;
    if (exp < 3) {
      items.push({
        course: 'Mentorship / trade skill development plan',
        reason: 'Build competency for complex tasks',
        due_window: '90+ days',
        priority: 'low',
      });
    }
    if ((input.worker_profile.past_incidents?.length ?? 0) > 0) {
      items.push({
        course: 'Human performance / error prevention refresher',
        reason: 'Support learning from prior incidents',
        due_window: '90+ days',
        priority: 'medium',
      });
    }
    return items;
  }

  private buildFieldSummary(
    input: TrainingCompetencyEngineInput,
    gaps: TrainingGap[],
    plan: PrioritizedTrainingPlan,
  ): string {
    const role = input.worker_profile.role ?? 'worker';
    const trade = input.worker_profile.trade
      ? ` (${input.worker_profile.trade})`
      : '';
    const immediate = plan.immediate_required_training.map((p) => p.course);
    const tasks =
      input.project_scope.tasks?.slice(0, 2).join(', ') ?? 'assigned work';

    if (!gaps.length) {
      return `${role}${trade} meets current training requirements for ${tasks}. Confirm orientations and task-specific permits before start.`;
    }

    const immediateText = immediate.length
      ? `Stop-work until complete: ${immediate.join(', ')}.`
      : 'No immediate stop-work training gaps.';

    const topGap = gaps[0];
    return [
      `${role}${trade} — ${gaps.length} training gap(s) for ${tasks}.`,
      immediateText,
      topGap?.linked_risk
        ? `Critical risk driver: ${topGap.linked_risk}.`
        : null,
      `Short-term plan: ${plan.short_term_training.length} course(s) within 30–90 days.`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
