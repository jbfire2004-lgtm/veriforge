import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HazardControlCatalogService } from '../jha-flha/hazard-control-catalog.service';
import { JhaFlhaEngineService } from '../jha-flha/jha-flha-engine.service';
import type {
  JhaFlhaEngineControl,
  JhaFlhaEngineInput,
} from '../jha-flha/jha-flha-engine.types';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerProjectReadinessService } from '../workers/worker-project-readiness.service';
import type {
  PredictedHazard,
  RecommendedControl,
  RequiredTrainingItem,
  SafetyWorkflowAiInput,
  SafetyWorkflowAiJson,
  SafetyWorkflowAiResult,
  SafetyWorkflowGap,
  SafetyWorkflowType,
  WorkerReadinessItem,
} from './safety-workflow-ai.types';

const HIERARCHY_RANK: Record<RecommendedControl['hierarchy'], number> = {
  elimination: 5,
  substitution: 4,
  engineering: 3,
  administrative: 2,
  ppe: 1,
};

const HAZARD_PPE_MAP: Array<{ pattern: RegExp; ppe: string[] }> = [
  {
    pattern: /height|fall|scaffold|roof/i,
    ppe: ['Hard hat', 'Fall protection harness'],
  },
  {
    pattern: /weld|hot work|torch|burn/i,
    ppe: ['FR coveralls', 'Welding face shield', 'Fire-resistant gloves'],
  },
  {
    pattern: /chemical|hazmat|whmis|solvent/i,
    ppe: ['Chemical-resistant gloves', 'Safety goggles', 'Respirator'],
  },
  { pattern: /noise|grinder|saw/i, ppe: ['Hearing protection'] },
  {
    pattern: /excavat|trench|ground disturb/i,
    ppe: ['Steel-toe boots', 'High-visibility vest'],
  },
  {
    pattern: /electrical|energized|arc flash/i,
    ppe: ['Arc-rated PPE', 'Insulated gloves'],
  },
  {
    pattern: /confined space/i,
    ppe: ['Gas monitor', 'Supplied-air or SCBA (rescue)'],
  },
];

@Injectable()
export class SafetyWorkflowAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jhaEngine: JhaFlhaEngineService,
    private readonly hazardCatalog: HazardControlCatalogService,
    private readonly trainingEngine: TrainingCompetencyEngineService,
    private readonly workerReadiness: WorkerProjectReadinessService,
  ) {}

  async analyze(input: SafetyWorkflowAiInput): Promise<SafetyWorkflowAiResult> {
    this.validateInput(input);

    const workflowType = input.workflowType ?? 'FLHA';
    const task = input.task.trim();

    const engineInput = this.buildEngineInput(input, workflowType);
    const engineOutput = this.jhaEngine.generate(engineInput);

    const catalogHazards = await this.hazardCatalog.suggestHazardsForTask(
      input.companyId,
      input.projectId,
      {
        taskDescription: [task, input.workScope, input.locationNote]
          .filter(Boolean)
          .join(' '),
        locationNote: input.locationNote,
        weather: input.environment?.weather,
        existingHazardDescriptions: input.existingHazardDescriptions,
      },
    );

    const predicted_hazards = this.mergePredictedHazards(
      engineOutput,
      catalogHazards.suggestedHazards,
      input.knownCriticalRisks,
    );

    const hazardCategories = [
      ...new Set(predicted_hazards.map((h) => h.category)),
    ];
    const hazardDescriptions = predicted_hazards.map((h) => h.description);
    const energyTypes = this.inferEnergyTypes(
      predicted_hazards,
      engineOutput.energy_wheel,
    );

    const catalogControls = await this.hazardCatalog.suggestControlsForHazards(
      input.companyId,
      input.projectId,
      {
        taskDescription: task,
        hazardCategories,
        hazardDescriptions,
        energyTypes,
        existingControlDescriptions: input.existingControlDescriptions,
      },
    );

    const recommended_controls = this.mergeRecommendedControls(
      engineOutput,
      catalogControls.suggestedControls,
      predicted_hazards,
      workflowType,
    );

    const required_training = await this.buildRequiredTraining(
      input,
      predicted_hazards,
    );

    const projectPpe = await this.loadProjectRequiredPpe(input.projectId);
    const inferredPpe = this.inferRequiredPpe(
      predicted_hazards,
      recommended_controls,
    );
    const allRequiredPpe = this.uniqueStrings([
      ...projectPpe,
      ...inferredPpe,
      ...(input.requiredPpe ?? []),
    ]);

    const worker_readiness = await this.evaluateWorkers(
      input.workerIds ?? [],
      input.projectId,
      required_training,
      allRequiredPpe,
      recommended_controls,
      predicted_hazards,
    );

    const gaps = this.buildGaps(
      predicted_hazards,
      recommended_controls,
      required_training,
      worker_readiness,
      allRequiredPpe,
      input.existingControlDescriptions ?? [],
    );

    const safety_quality_score = this.computeSafetyQualityScore(
      predicted_hazards,
      recommended_controls,
      required_training,
      worker_readiness,
      gaps,
      input.existingControlDescriptions ?? [],
    );

    const core: SafetyWorkflowAiJson = {
      task,
      predicted_hazards,
      recommended_controls,
      required_training,
      worker_readiness,
      safety_quality_score,
    };

    return {
      ...core,
      analysis_id: randomUUID(),
      workflow_type: workflowType,
      gaps,
      field_summary: this.buildFieldSummary(core, workflowType, gaps),
      source: 'rule_engine',
      model: null,
    };
  }

  private validateInput(input: SafetyWorkflowAiInput) {
    if (!input.task?.trim()) throw new BadRequestException('task is required');
    if (!input.companyId)
      throw new BadRequestException('companyId is required');
    if (!input.projectId)
      throw new BadRequestException('projectId is required');
  }

  private buildEngineInput(
    input: SafetyWorkflowAiInput,
    workflowType: SafetyWorkflowType,
  ): JhaFlhaEngineInput {
    const kind = workflowType === 'JHA' ? 'JHA' : 'FLHA';
    return {
      task_description: input.task,
      task_steps: input.taskSteps,
      environment: input.environment,
      equipment_and_tools: input.equipment,
      materials: input.materials,
      known_critical_risks: input.knownCriticalRisks,
      kind,
      companyId: input.companyId,
      projectId: input.projectId,
    };
  }

  private mergePredictedHazards(
    engineOutput: ReturnType<JhaFlhaEngineService['generate']>,
    catalogSuggestions: Array<{
      description: string;
      category?: string;
      score?: number;
      reason?: string;
    }>,
    criticalRisks?: string[],
  ): PredictedHazard[] {
    const seen = new Set<string>();
    const out: PredictedHazard[] = [];

    const add = (h: PredictedHazard) => {
      const key = h.description.toLowerCase().trim();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(h);
    };

    for (const step of engineOutput.jha_steps) {
      for (const h of step.hazards) {
        add({
          category: h.category,
          description: h.description,
          sif_potential: Boolean(h.sif_potential),
          confidence: 'high',
          source: 'engine',
        });
      }
    }

    for (const h of catalogSuggestions) {
      add({
        category: h.category ?? 'Field',
        description: h.description,
        sif_potential:
          /sif|fatal|serious|fall|confined|line of fire|energized|excavat/i.test(
            h.description,
          ),
        confidence:
          (h.score ?? 0) >= 8 ? 'high' : (h.score ?? 0) >= 5 ? 'medium' : 'low',
        source: 'catalog',
      });
    }

    for (const risk of criticalRisks ?? []) {
      add({
        category: 'critical_risk',
        description: risk,
        sif_potential: true,
        confidence: 'high',
        source: 'critical_risk',
      });
    }

    return out.slice(0, 24);
  }

  private mergeRecommendedControls(
    engineOutput: ReturnType<JhaFlhaEngineService['generate']>,
    catalogSuggestions: Array<{
      description: string;
      controlType?: string;
      ppeRequired?: boolean;
      controlClass?: string;
    }>,
    hazards: PredictedHazard[],
    workflowType: SafetyWorkflowType,
  ): RecommendedControl[] {
    const seen = new Set<string>();
    const out: RecommendedControl[] = [];
    const sifMode = workflowType === 'SIF' || workflowType === 'HECA';

    const hazardDescriptions = hazards.map((h) => h.description);

    const add = (c: RecommendedControl) => {
      const key = c.description.toLowerCase().trim();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(c);
    };

    for (const step of engineOutput.jha_steps) {
      for (const c of step.controls) {
        add(this.mapEngineControl(c, hazardDescriptions, sifMode));
      }
    }

    for (const c of catalogSuggestions) {
      add({
        hierarchy: this.hierarchyFromControlType(
          c.controlType ?? 'administrative',
        ),
        description: c.description,
        ppe_required: Boolean(c.ppeRequired),
        sif_verification: sifMode || hazards.some((h) => h.sif_potential),
        linked_hazards: hazardDescriptions.slice(0, 3),
      });
    }

    return this.sortControlsByHierarchy(out).slice(0, 20);
  }

  private mapEngineControl(
    c: JhaFlhaEngineControl,
    linkedHazards: string[],
    sifMode: boolean,
  ): RecommendedControl {
    return {
      hierarchy: c.hierarchy,
      description: c.description,
      ppe_required: c.hierarchy === 'ppe',
      sif_verification: Boolean(c.sif_verification) || sifMode,
      linked_hazards: linkedHazards.slice(0, 3),
    };
  }

  private hierarchyFromControlType(
    controlType: string,
  ): RecommendedControl['hierarchy'] {
    const t = controlType.toLowerCase();
    if (t === 'elimination') return 'elimination';
    if (t === 'substitution') return 'substitution';
    if (t === 'engineering') return 'engineering';
    if (t === 'ppe') return 'ppe';
    return 'administrative';
  }

  private sortControlsByHierarchy(
    controls: RecommendedControl[],
  ): RecommendedControl[] {
    return [...controls].sort(
      (a, b) => HIERARCHY_RANK[b.hierarchy] - HIERARCHY_RANK[a.hierarchy],
    );
  }

  private inferEnergyTypes(
    hazards: PredictedHazard[],
    energyWheel: Array<{ energy_type: string }>,
  ): string[] {
    const fromWheel = energyWheel.map((e) => e.energy_type);
    const text = hazards
      .map((h) => h.description)
      .join(' ')
      .toLowerCase();
    const inferred: string[] = [];
    if (/fall|height|drop|gravity/.test(text)) inferred.push('gravity');
    if (/electrical|energized|arc/.test(text)) inferred.push('electrical');
    if (/pressure|hydraulic|pneumatic/.test(text)) inferred.push('pressure');
    if (/chemical|toxic|vapor/.test(text)) inferred.push('chemical');
    if (/vehicle|traffic|crane|lift|mechanical/.test(text))
      inferred.push('mechanical');
    if (/heat|weld|fire|thermal/.test(text)) inferred.push('thermal');
    return this.uniqueStrings([...fromWheel, ...inferred]);
  }

  private async buildRequiredTraining(
    input: SafetyWorkflowAiInput,
    hazards: PredictedHazard[],
  ): Promise<RequiredTrainingItem[]> {
    const projectScope = {
      tasks: [input.task, ...(input.taskSteps ?? [])],
      equipment: input.equipment ?? [],
      critical_risks: [
        ...(input.knownCriticalRisks ?? []),
        ...hazards.filter((h) => h.sif_potential).map((h) => h.description),
      ],
    };

    const output = this.trainingEngine.generate({
      worker_profile: { role: 'field_worker', trade: 'general' },
      project_scope: projectScope,
      companyId: input.companyId,
      projectId: input.projectId,
    });

    const items: RequiredTrainingItem[] = [];
    const seen = new Set<string>();

    const add = (
      course: string,
      reason: string,
      priority: RequiredTrainingItem['priority'],
      linked?: string,
    ) => {
      const key = course.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ course, reason, priority, linked_hazard: linked });
    };

    for (const gap of output.gaps) {
      add(
        gap.course,
        gap.remediation || gap.drivers.join('; ') || 'Required for task scope',
        gap.priority_tier === 'immediate'
          ? 'high'
          : gap.priority_tier === 'short_term'
          ? 'medium'
          : 'low',
        gap.linked_risk,
      );
    }

    for (const item of output.prioritized_training_plan
      .immediate_required_training) {
      add(item.course, item.reason, 'high');
    }
    for (const item of output.prioritized_training_plan.short_term_training) {
      add(item.course, item.reason, 'medium');
    }

    return items.slice(0, 16);
  }

  private async loadProjectRequiredPpe(projectId: number): Promise<string[]> {
    const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
      where: { projectId, deletedAt: null },
      select: { requiredPpe: true },
    });
    if (!profile?.requiredPpe) return [];
    const raw = profile.requiredPpe;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === 'string');
  }

  private inferRequiredPpe(
    hazards: PredictedHazard[],
    controls: RecommendedControl[],
  ): string[] {
    const text = [
      ...hazards.map((h) => h.description),
      ...controls.filter((c) => c.ppe_required).map((c) => c.description),
    ].join(' ');

    const ppe: string[] = [];
    for (const rule of HAZARD_PPE_MAP) {
      if (rule.pattern.test(text)) ppe.push(...rule.ppe);
    }
    if (!ppe.length) ppe.push('Hard hat', 'Safety glasses', 'Steel-toe boots');
    return this.uniqueStrings(ppe);
  }

  private async evaluateWorkers(
    workerIds: number[],
    projectId: number,
    requiredTraining: RequiredTrainingItem[],
    requiredPpe: string[],
    controls: RecommendedControl[],
    hazards: PredictedHazard[],
  ): Promise<WorkerReadinessItem[]> {
    if (!workerIds.length) return [];

    const results: WorkerReadinessItem[] = [];

    for (const workerId of workerIds) {
      const readiness = await this.workerReadiness.evaluate(
        workerId,
        projectId,
      );
      const workerInput = await this.trainingEngine.buildInputFromWorker(
        workerId,
        projectId,
        {
          tasks: requiredTraining.map((t) => t.course),
          critical_risks: hazards
            .filter((h) => h.sif_potential)
            .map((h) => h.description),
        },
      );
      const trainingDetail = this.trainingEngine.generate(workerInput);

      const training_gaps = trainingDetail.gaps.map(
        (g) => `${g.course} (${g.status})`,
      );

      const control_gaps = this.detectControlGaps(
        controls,
        hazards,
        training_gaps,
      );

      const missing_ppe = requiredPpe.filter((ppe) => {
        const lower = ppe.toLowerCase();
        const records = workerInput.current_training_records ?? [];
        return !records.some((r) =>
          r.course.toLowerCase().includes(lower.split(' ')[0] ?? lower),
        );
      });

      const gaps = this.uniqueStrings([
        ...readiness.blocking_items,
        ...training_gaps.map((g) => `Training gap: ${g}`),
        ...control_gaps.map((g) => `Control gap: ${g}`),
        ...missing_ppe.map((p) => `Missing PPE: ${p}`),
      ]);

      results.push({
        worker_id: workerId,
        worker_name: await this.resolveWorkerName(workerId),
        status: readiness.status,
        ready_for_task: readiness.status === 'READY' && gaps.length === 0,
        gaps,
        training_gaps,
        missing_ppe,
        control_gaps,
      });
    }

    return results;
  }

  private detectControlGaps(
    controls: RecommendedControl[],
    hazards: PredictedHazard[],
    trainingGaps: string[],
  ): string[] {
    const gaps: string[] = [];
    const sifHazards = hazards.filter((h) => h.sif_potential);
    const hasSifVerification = controls.some((c) => c.sif_verification);

    if (sifHazards.length && !hasSifVerification) {
      gaps.push('SIF-potential hazards lack verified critical controls');
    }

    const highest = controls.reduce(
      (max, c) => Math.max(max, HIERARCHY_RANK[c.hierarchy]),
      0,
    );
    if (sifHazards.length && highest <= HIERARCHY_RANK.ppe) {
      gaps.push('Controls rely on PPE only for SIF-potential work');
    }

    if (
      /confined space/i.test(hazards.map((h) => h.description).join(' ')) &&
      trainingGaps.some((g) => /confined/i.test(g))
    ) {
      gaps.push('Confined space entry training required before permit');
    }

    return gaps;
  }

  private async resolveWorkerName(workerId: number): Promise<string> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { firstName: true, lastName: true },
    });
    if (!worker) return `Worker ${workerId}`;
    return `${worker.firstName} ${worker.lastName}`.trim();
  }

  private buildGaps(
    hazards: PredictedHazard[],
    controls: RecommendedControl[],
    training: RequiredTrainingItem[],
    workers: WorkerReadinessItem[],
    requiredPpe: string[],
    existingControls: string[],
  ): SafetyWorkflowGap[] {
    const gaps: SafetyWorkflowGap[] = [];

    const sifHazards = hazards.filter((h) => h.sif_potential);
    const hasSifControl = controls.some((c) => c.sif_verification);

    if (sifHazards.length && !hasSifControl) {
      gaps.push({
        type: 'control',
        description: `${sifHazards.length} SIF-potential hazard(s) without verified critical controls`,
        severity: 'critical',
      });
    }

    for (const t of training.filter((x) => x.priority === 'high')) {
      gaps.push({
        type: 'training',
        description: `Required training: ${t.course}`,
        severity: 'critical',
      });
    }

    for (const c of controls) {
      const covered = existingControls.some((e) =>
        e.toLowerCase().includes(c.description.toLowerCase().slice(0, 24)),
      );
      if (!covered && c.sif_verification) {
        gaps.push({
          type: 'control',
          description: `Missing SIF control: ${c.description}`,
          severity: 'warning',
        });
      }
    }

    for (const ppe of requiredPpe.slice(0, 6)) {
      gaps.push({
        type: 'ppe',
        description: `Confirm PPE issued: ${ppe}`,
        severity: 'info',
      });
    }

    for (const w of workers.filter((x) => !x.ready_for_task)) {
      gaps.push({
        type: 'readiness',
        description: `${w.worker_name} — ${w.status}`,
        severity: w.status === 'NOT QUALIFIED' ? 'critical' : 'warning',
      });
    }

    return gaps.slice(0, 30);
  }

  private computeSafetyQualityScore(
    hazards: PredictedHazard[],
    controls: RecommendedControl[],
    training: RequiredTrainingItem[],
    workers: WorkerReadinessItem[],
    gaps: SafetyWorkflowGap[],
    existingControls: string[],
  ): number {
    let score = 100;

    const sifHazards = hazards.filter((h) => h.sif_potential);
    const sifControls = controls.filter((c) => c.sif_verification);
    if (sifHazards.length && sifControls.length < sifHazards.length) {
      score -= Math.min(25, (sifHazards.length - sifControls.length) * 8);
    }

    const highTraining = training.filter((t) => t.priority === 'high').length;
    score -= Math.min(20, highTraining * 5);

    for (const w of workers) {
      if (w.status === 'NOT QUALIFIED') score -= 15;
      else if (w.status === 'RESTRICTED') score -= 8;
      score -= Math.min(10, w.training_gaps.length * 2);
      score -= Math.min(6, w.missing_ppe.length);
    }

    const criticalGaps = gaps.filter((g) => g.severity === 'critical').length;
    score -= Math.min(20, criticalGaps * 5);

    const coveredControls = controls.filter((c) =>
      existingControls.some((e) =>
        e.toLowerCase().includes(c.description.toLowerCase().slice(0, 20)),
      ),
    ).length;
    if (controls.length && coveredControls / controls.length < 0.4) {
      score -= 10;
    }

    const strongControls = controls.filter(
      (c) => HIERARCHY_RANK[c.hierarchy] >= HIERARCHY_RANK.engineering,
    ).length;
    score += Math.min(10, strongControls * 2);

    if (!hazards.length && controls.length === 0) score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private buildFieldSummary(
    core: SafetyWorkflowAiJson,
    workflowType: SafetyWorkflowType,
    gaps: SafetyWorkflowGap[],
  ): string {
    const sifCount = core.predicted_hazards.filter(
      (h) => h.sif_potential,
    ).length;
    const readyCount = core.worker_readiness.filter(
      (w) => w.ready_for_task,
    ).length;
    const crewTotal = core.worker_readiness.length;
    const critical = gaps.filter((g) => g.severity === 'critical').length;

    const parts = [
      `${workflowType} analysis for "${core.task.slice(0, 80)}${
        core.task.length > 80 ? '…' : ''
      }".`,
      `${core.predicted_hazards.length} predicted hazard(s)${
        sifCount ? ` (${sifCount} SIF-potential)` : ''
      }.`,
      `${core.recommended_controls.length} control(s) across hierarchy of controls.`,
      `${core.required_training.length} training requirement(s) mapped.`,
    ];

    if (crewTotal) {
      parts.push(
        `${readyCount}/${crewTotal} assigned worker(s) ready for this task.`,
      );
    }

    parts.push(`Safety Quality Score: ${core.safety_quality_score}/100.`);

    if (critical) {
      parts.push(
        `${critical} critical gap(s) require supervisor action before work proceeds.`,
      );
    } else if (core.safety_quality_score >= 80) {
      parts.push(
        'Plan meets baseline quality — verify controls in the field before start.',
      );
    }

    return parts.join(' ');
  }

  private uniqueStrings(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
      const key = v.toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(v);
    }
    return out;
  }
}
