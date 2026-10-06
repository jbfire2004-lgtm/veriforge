import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PERMIT_TYPE_SEEDS } from '../../prisma/data/permit-types';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerProjectReadinessService } from '../workers/worker-project-readiness.service';
import { PermitAiService } from './permit-ai.service';
import type {
  PermitConflict,
  PermitRecommendedControl,
  PermitRequiredDocument,
  PermitToWorkAiInput,
  PermitToWorkAiJson,
  PermitToWorkAiResult,
  PermitToWorkStatus,
  WorkerQualificationSummary,
} from './permit-to-work-ai.types';

const DOCUMENT_REQUIREMENTS: Record<
  string,
  Array<{ document: string; reason: string }>
> = {
  hot_work: [
    {
      document: 'Current JHA / FLHA for work area',
      reason: 'Hot work requires documented hazard analysis',
    },
    {
      document: 'Hot Work Safety training certificate',
      reason: 'Competent worker authorization',
    },
    {
      document: 'Fire watch assignment record',
      reason: 'NFPA / site hot work standard',
    },
    {
      document: 'Fire extinguisher inspection tag (current)',
      reason: 'Fire suppression readiness',
    },
  ],
  confined_space: [
    {
      document: 'Confined Space Entry training certificate',
      reason: 'Entrant competency',
    },
    {
      document: 'Atmospheric monitoring log',
      reason: 'Pre-entry and continuous monitoring',
    },
    { document: 'Rescue plan', reason: 'Emergency retrieval capability' },
    {
      document: 'Energy isolation (LOTO) record',
      reason: 'Non-entry hazard control',
    },
  ],
  fall_protection: [
    {
      document: 'Fall Protection training certificate',
      reason: 'Work at height competency',
    },
    {
      document: 'Rescue plan for work at height',
      reason: 'Suspended worker retrieval',
    },
    {
      document: 'Harness / lanyard inspection record',
      reason: 'PPE condition verification',
    },
  ],
  loto: [
    { document: 'LOTO training certificate', reason: 'Authorized worker' },
    {
      document: 'Equipment-specific isolation procedure',
      reason: 'Correct energy sources identified',
    },
    {
      document: 'Zero-energy verification record',
      reason: 'Confirm de-energized state',
    },
  ],
  excavation: [
    {
      document: 'Utility locate ticket',
      reason: 'Underground strike prevention',
    },
    {
      document: 'Excavation & Trenching training',
      reason: 'Competent person requirements',
    },
    {
      document: 'Soil classification / protective system plan',
      reason: 'Cave-in prevention',
    },
  ],
  live_line: [
    {
      document: 'Electrical Safety / Arc Flash training',
      reason: 'Qualified electrical worker',
    },
    { document: 'Energized work procedure', reason: 'Live-line authorization' },
    { document: 'Job briefing record', reason: 'Crew hazard communication' },
  ],
  open_hole: [
    {
      document: 'Fall Protection training certificate',
      reason: 'Opening fall exposure',
    },
    {
      document: 'Cover / guardrail inspection record',
      reason: 'Opening protection verification',
    },
  ],
};

@Injectable()
export class PermitToWorkAiService {
  constructor(
    private readonly permitAi: PermitAiService,
    private readonly prisma: PrismaService,
    private readonly workerReadiness: WorkerProjectReadinessService,
  ) {}

  async evaluate(input: PermitToWorkAiInput): Promise<PermitToWorkAiResult> {
    const suggestion = await this.permitAi.suggest(input);
    const seed = PERMIT_TYPE_SEEDS.find(
      (p) => p.permitType === input.permitType,
    );
    const permitType = seed?.name ?? String(input.permitType);
    const fieldValues = {
      ...suggestion.fieldValues,
      ...(input.fieldValues ?? {}),
    };

    const worker_qualification = await this.evaluateWorkerQualification(
      input,
      suggestion.training,
    );
    const required_documents = await this.buildRequiredDocuments(
      input,
      suggestion.training.requirements,
      worker_qualification,
    );

    const activePermits = await this.loadActivePermits(input.projectId);
    const conflicts_detected = this.detectConflicts(
      input,
      fieldValues,
      suggestion,
      worker_qualification,
      activePermits,
    );

    const recommended_controls = this.buildRecommendedControls(
      suggestion.controls,
      input.permitType,
      conflicts_detected,
    );

    const high_risk_flags = conflicts_detected
      .filter((c) => c.severity === 'critical')
      .map((c) => c.description);

    const final_permit_status = this.deriveFinalStatus(
      conflicts_detected,
      worker_qualification,
      input,
      suggestion,
      required_documents,
    );

    const core: PermitToWorkAiJson = {
      permit_type: permitType,
      required_documents,
      conflicts_detected,
      recommended_controls,
      final_permit_status,
    };

    return {
      ...core,
      evaluation_id: randomUUID(),
      worker_qualification,
      high_risk_flags,
      field_summary: this.buildFieldSummary(core, worker_qualification),
      source: 'rule_engine',
      model: null,
    };
  }

  private async evaluateWorkerQualification(
    input: PermitToWorkAiInput,
    training: Awaited<ReturnType<PermitAiService['suggest']>>['training'],
  ): Promise<WorkerQualificationSummary> {
    if (!input.workerId) {
      return {
        training_valid: false,
        project_ready: false,
        blocking_items: [
          'No worker assigned — qualifications cannot be verified',
        ],
      };
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
      select: { id: true, firstName: true, lastName: true },
    });

    const readiness = await this.workerReadiness.evaluate(
      input.workerId,
      input.projectId,
    );
    const training_valid = training.valid;
    const blocking_items = [
      ...readiness.blocking_items,
      ...training.requirements
        .filter((r) => r.status !== 'valid')
        .map((r) => `Missing permit training: ${r.name || r.code}`),
    ];

    return {
      worker_id: input.workerId,
      worker_name: worker
        ? `${worker.firstName} ${worker.lastName}`.trim()
        : undefined,
      training_valid,
      project_ready: readiness.status === 'READY',
      blocking_items: [...new Set(blocking_items)],
    };
  }

  private async buildRequiredDocuments(
    input: PermitToWorkAiInput,
    trainingReqs: Array<{ code: string; name?: string; status: string }>,
    worker: WorkerQualificationSummary,
  ): Promise<PermitRequiredDocument[]> {
    const templates = DOCUMENT_REQUIREMENTS[input.permitType] ?? [
      { document: 'Site orientation', reason: 'Project access requirement' },
      { document: 'Applicable JHA / FLHA', reason: 'Task hazard analysis' },
    ];

    const docs: PermitRequiredDocument[] = templates.map((t) => {
      const trainingMatch = trainingReqs.find(
        (r) =>
          t.document.toLowerCase().includes(r.code.toLowerCase()) ||
          t.document.toLowerCase().includes((r.name ?? '').toLowerCase()),
      );

      let status: PermitRequiredDocument['status'] = 'required';
      if (trainingMatch?.status === 'valid') status = 'present';
      else if (trainingMatch?.status === 'expired') status = 'expired';
      else if (t.document.toLowerCase().includes('jha') && input.jhaFlhaId) {
        status = 'present';
      } else if (
        worker.blocking_items.some((b) =>
          b.toLowerCase().includes(t.document.toLowerCase().slice(0, 12)),
        )
      ) {
        status = 'missing';
      }

      return { document: t.document, status, reason: t.reason };
    });

    if (this.scopeHasChemicals(input.jobScope)) {
      docs.push({
        document: 'SDS for chemicals in work area',
        status: 'required',
        reason: 'Chemical exposure — WHMIS / SDS acknowledgment required',
      });
    }

    const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
      where: { projectId: input.projectId, deletedAt: null },
      select: { requiredEmergencyPlans: true },
    });
    const emergencyPlans = (profile?.requiredEmergencyPlans as string[]) ?? [];
    for (const plan of emergencyPlans.slice(0, 3)) {
      docs.push({
        document: plan,
        status: 'required',
        reason: 'Project safety profile emergency plan',
      });
    }

    return docs;
  }

  private async loadActivePermits(projectId: number) {
    const now = new Date();
    return this.prisma.pmPermit.findMany({
      where: {
        projectId,
        status: 'active',
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
      select: {
        id: true,
        permitType: true,
        title: true,
        workflowJson: true,
        validFrom: true,
        validTo: true,
      },
    });
  }

  private detectConflicts(
    input: PermitToWorkAiInput,
    fieldValues: Record<string, unknown>,
    suggestion: Awaited<ReturnType<PermitAiService['suggest']>>,
    worker: WorkerQualificationSummary,
    activePermits: Awaited<
      ReturnType<PermitToWorkAiService['loadActivePermits']>
    >,
  ): PermitConflict[] {
    const conflicts: PermitConflict[] = [];
    const scope = `${input.jobScope} ${input.locationNote ?? ''}`.toLowerCase();
    const permitType = input.permitType;

    if (!input.workerId) {
      conflicts.push({
        code: 'NO_WORKER',
        severity: 'warning',
        description: 'No authorized worker assigned to permit',
        mitigation: 'Assign a qualified worker before activation',
      });
    }

    if (input.workerId && !worker.training_valid) {
      conflicts.push({
        code: 'TRAINING_GAP',
        severity: 'critical',
        description: 'Worker missing or expired required permit training',
        mitigation:
          'Complete training verification in Core before issuing permit',
      });
    }

    if (input.workerId && !worker.project_ready) {
      conflicts.push({
        code: 'PROJECT_READINESS',
        severity: 'critical',
        description:
          'Worker not project-ready (orientation, training, or contractor gate)',
        mitigation:
          'Resolve blocking items on worker project-readiness profile',
      });
    }

    if (permitType === 'hot_work') {
      const combustiblesCleared = fieldValues.combustibles_cleared === true;
      const hasFlammables =
        /flammab|combustib|fuel|solvent|propane|gasoline|diesel|tank|vapor/i.test(
          scope,
        );

      if (hasFlammables && !combustiblesCleared) {
        conflicts.push({
          code: 'HOT_WORK_NEAR_FLAMMABLES',
          severity: 'critical',
          description:
            'Hot work near flammables/combustibles — clearance not verified',
          mitigation:
            'Clear combustibles within 35 ft or use fire-resistant barriers',
        });
      }

      if (!fieldValues.fire_watch && !scope.includes('fire watch')) {
        conflicts.push({
          code: 'HOT_WORK_NO_FIRE_WATCH',
          severity: 'critical',
          description: 'Hot work permit without assigned fire watch',
          mitigation:
            'Designate trained fire watch for duration plus 30 minutes',
        });
      }

      if (fieldValues.extinguisher_ready === false) {
        conflicts.push({
          code: 'HOT_WORK_NO_EXTINGUISHER',
          severity: 'critical',
          description: 'Fire extinguisher not confirmed ready',
          mitigation: 'Position inspected extinguisher within 10 m of work',
        });
      }

      const activeHotWork = activePermits.filter(
        (p) => p.permitType === 'hot_work',
      );
      if (activeHotWork.length && this.sameLocation(scope, activeHotWork)) {
        conflicts.push({
          code: 'HOT_WORK_OVERLAP',
          severity: 'warning',
          description:
            'Another active hot work permit may overlap this location',
          mitigation:
            'Coordinate fire watch and combustible control across permits',
        });
      }
    }

    if (permitType === 'confined_space') {
      const hasAttendant =
        input.attendantAssigned === true ||
        Boolean(fieldValues.attendant) ||
        scope.includes('attendant');

      if (!hasAttendant) {
        conflicts.push({
          code: 'CS_NO_ATTENDANT',
          severity: 'critical',
          description: 'Confined space entry without dedicated attendant',
          mitigation:
            'Assign trained attendant at entry point — no other duties',
        });
      }

      if (!fieldValues.atmospheric_tests && !scope.includes('atmospheric')) {
        conflicts.push({
          code: 'CS_NO_ATMOSPHERIC_TEST',
          severity: 'critical',
          description:
            'No atmospheric test results documented for confined space entry',
          mitigation:
            'Complete O₂/LEL/toxic gas testing before and during entry',
        });
      }

      if (fieldValues.isolation_verified === false) {
        conflicts.push({
          code: 'CS_NO_ISOLATION',
          severity: 'critical',
          description: 'Energy isolation not verified for confined space',
          mitigation: 'Apply LOTO and verify zero energy before entry',
        });
      }

      const activeHotWork = activePermits.some(
        (p) => p.permitType === 'hot_work',
      );
      if (activeHotWork && scope.includes('weld')) {
        conflicts.push({
          code: 'CS_HOT_WORK_INSIDE',
          severity: 'critical',
          description:
            'Hot work inside confined space with active site hot work — atmosphere risk',
          mitigation:
            'Continuous atmospheric monitoring and dedicated ventilation',
        });
      }
    }

    if (permitType === 'fall_protection') {
      if (fieldValues['100_percent_tieoff'] === false) {
        conflicts.push({
          code: 'FALL_NO_TIEOFF',
          severity: 'critical',
          description: '100% tie-off not confirmed for work at height',
          mitigation: 'Maintain continuous fall protection anchor connection',
        });
      }
      const fallDistance = Number(fieldValues.fall_distance);
      if (fallDistance > 6 && fieldValues.rescue_plan === false) {
        conflicts.push({
          code: 'FALL_RESCUE_PLAN',
          severity: 'warning',
          description: 'Fall distance exceeds 6 ft — rescue plan not confirmed',
          mitigation:
            'Brief rescue plan and ensure prompt retrieval capability',
        });
      }
    }

    if (permitType === 'excavation') {
      const depth = Number(fieldValues.depth);
      if (depth >= 4 && !fieldValues.protection_system) {
        conflicts.push({
          code: 'EXCAVATION_NO_PROTECTION',
          severity: 'critical',
          description: 'Excavation ≥4 ft without protective system documented',
          mitigation:
            'Install sloping, shoring, or trench box per competent person',
        });
      }
      if (!fieldValues.utility_locate) {
        conflicts.push({
          code: 'EXCAVATION_NO_LOCATE',
          severity: 'critical',
          description: 'Utility locate ticket not referenced',
          mitigation:
            'Obtain and respect utility locate before breaking ground',
        });
      }
    }

    if (permitType === 'loto' && fieldValues.zero_energy_verified === false) {
      conflicts.push({
        code: 'LOTO_ZERO_ENERGY',
        severity: 'critical',
        description: 'Zero energy state not verified before work',
        mitigation: 'Test for zero energy after lockout application',
      });
    }

    if (permitType === 'live_line' && !worker.training_valid) {
      conflicts.push({
        code: 'LIVE_LINE_UNQUALIFIED',
        severity: 'critical',
        description:
          'Worker electrical qualification not verified for live-line work',
        mitigation:
          'Only qualified electrical workers may perform energized work',
      });
    }

    if (!suggestion.equipment.valid && suggestion.equipment.items.length > 0) {
      conflicts.push({
        code: 'EQUIPMENT_CERT',
        severity: 'warning',
        description:
          'Equipment certification missing or expired for listed assets',
        mitigation: 'Verify equipment inspection and operator authorization',
      });
    }

    if (!suggestion.weather.proceed) {
      conflicts.push({
        code: 'WEATHER_HOLD',
        severity: 'warning',
        description: 'Weather conditions may exceed permit limits',
        mitigation:
          'Confirm wind, precipitation, and temperature within limits',
      });
    }

    if (suggestion.incidents.recentCount > 0) {
      conflicts.push({
        code: 'RECENT_INCIDENTS',
        severity: 'warning',
        description: `${suggestion.incidents.recentCount} recent incident(s) involving assigned worker`,
        mitigation: 'Supervisor review before permit approval',
      });
    }

    for (const block of suggestion.overridableBlocks.filter((b) => b.blocked)) {
      conflicts.push({
        code: `BLOCK_${block.id.toUpperCase()}`,
        severity: block.id === 'training' ? 'critical' : 'warning',
        description: block.message,
        mitigation: block.canOverride
          ? 'Supervisor override with documented reason'
          : undefined,
      });
    }

    return conflicts;
  }

  private buildRecommendedControls(
    controls: Array<{
      key: string;
      label: string;
      selected: boolean;
      reason?: string;
    }>,
    permitType: string,
    conflicts: PermitConflict[],
  ): PermitRecommendedControl[] {
    const out: PermitRecommendedControl[] = controls
      .filter((c) => c.selected)
      .map((c) => ({
        hierarchy: this.hierarchyFromControlKey(c.key),
        description: c.label,
        reason: c.reason ?? 'Permit template default control',
        mandatory: true,
      }));

    const add = (control: PermitRecommendedControl) => {
      if (out.some((c) => c.description === control.description)) return;
      out.push(control);
    };

    if (conflicts.some((c) => c.code === 'HOT_WORK_NEAR_FLAMMABLES')) {
      add({
        hierarchy: 'engineering',
        description:
          'Remove or shield combustibles within 35 ft; use fire blankets',
        reason: 'Hot work near flammables conflict',
        mandatory: true,
      });
      add({
        hierarchy: 'administrative',
        description: 'Dedicated fire watch with extinguisher and communication',
        reason: 'Hot work near flammables conflict',
        mandatory: true,
      });
    }

    if (conflicts.some((c) => c.code === 'CS_NO_ATTENDANT')) {
      add({
        hierarchy: 'administrative',
        description: 'Station trained attendant at entry — no other duties',
        reason: 'Confined space attendant requirement',
        mandatory: true,
      });
    }

    if (conflicts.some((c) => c.code === 'CS_NO_ATMOSPHERIC_TEST')) {
      add({
        hierarchy: 'engineering',
        description:
          'Continuous atmospheric monitoring (O₂, LEL, H₂S as applicable)',
        reason: 'Confined space atmospheric hazard',
        mandatory: true,
      });
    }

    if (permitType === 'hot_work') {
      add({
        hierarchy: 'ppe',
        description: 'FR coveralls, face shield, and fire-resistant gloves',
        reason: 'Hot work PPE baseline',
        mandatory: true,
      });
    }

    return out.slice(0, 16);
  }

  private hierarchyFromControlKey(
    key: string,
  ): PermitRecommendedControl['hierarchy'] {
    if (key.includes('elimination')) return 'elimination';
    if (key.includes('substitution')) return 'substitution';
    if (key.includes('engineering')) return 'engineering';
    if (key.includes('ppe')) return 'ppe';
    return 'administrative';
  }

  private deriveFinalStatus(
    conflicts: PermitConflict[],
    worker: WorkerQualificationSummary,
    input: PermitToWorkAiInput,
    suggestion: Awaited<ReturnType<PermitAiService['suggest']>>,
    required_documents: PermitRequiredDocument[],
  ): PermitToWorkStatus {
    const critical = conflicts.filter((c) => c.severity === 'critical');

    if (!input.workerId || !input.jobScope?.trim()) return 'PENDING';
    if (critical.length > 0) return 'REJECTED';

    const warnings = conflicts.filter((c) => c.severity === 'warning');
    const missingDocs = required_documents.some(
      (d) => d.status === 'missing' || d.status === 'expired',
    );

    if (
      !worker.project_ready ||
      !worker.training_valid ||
      warnings.length > 0 ||
      missingDocs
    ) {
      return 'CONDITIONAL';
    }

    if (suggestion.overridableBlocks.some((b) => b.blocked)) {
      return 'CONDITIONAL';
    }

    return 'APPROVED';
  }

  private sameLocation(
    scope: string,
    permits: Array<{ workflowJson: unknown; title: string }>,
  ): boolean {
    const scopeWords = scope.split(/\s+/).filter((w) => w.length > 4);
    return permits.some((p) => {
      const wf = (p.workflowJson ?? {}) as {
        jobScope?: string;
        fieldValues?: Record<string, unknown>;
      };
      const loc = [
        p.title,
        wf.jobScope,
        wf.fieldValues?.work_location,
        wf.fieldValues?.excavation_location,
        wf.fieldValues?.space_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return scopeWords.some((w) => loc.includes(w));
    });
  }

  private scopeHasChemicals(scope: string): boolean {
    return /chemical|solvent|paint|epoxy|acid|caustic|whmis|sds|diesel|fuel/i.test(
      scope,
    );
  }

  private buildFieldSummary(
    core: PermitToWorkAiJson,
    worker: WorkerQualificationSummary,
  ): string {
    const critical = core.conflicts_detected.filter(
      (c) => c.severity === 'critical',
    ).length;
    const parts = [
      `${core.permit_type} evaluation — status ${core.final_permit_status}.`,
      `${core.conflicts_detected.length} conflict(s) detected (${critical} critical).`,
      `${core.recommended_controls.length} control(s) recommended.`,
      `${
        core.required_documents.filter(
          (d) => d.status === 'missing' || d.status === 'expired',
        ).length
      } document gap(s).`,
    ];
    if (worker.worker_name) {
      parts.push(
        `Worker ${worker.worker_name}: training ${
          worker.training_valid ? 'valid' : 'gap'
        }, project ${worker.project_ready ? 'ready' : 'not ready'}.`,
      );
    }
    return parts.join(' ');
  }
}
