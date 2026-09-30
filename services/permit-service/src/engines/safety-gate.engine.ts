import type { SafetyGateCheck, SafetyGateResult } from '../types';
import { jhaClient } from '../clients/jha.client';
import { trainingClient } from '../clients/training.client';
import { sdsClient } from '../clients/sds.client';
import { hazardControlClient } from '../clients/hazard-control.client';
import { pmTaskClient } from '../clients/pm-task.client';

export interface SafetyGateInput {
  companyId: string;
  token: string;
  jhaId?: string | null;
  workerId?: string | null;
  hazardId?: string | null;
  controlId?: string | null;
  equipmentId?: string | null;
  pmTaskId?: string | null;
  workerRole?: string;
  requireAll?: boolean;
}

export class SafetyGateEngine {
  async evaluate(input: SafetyGateInput): Promise<SafetyGateResult> {
    const checks: SafetyGateCheck[] = [];

    if (input.jhaId) {
      const score = await jhaClient.getScore({
        jhaId: input.jhaId,
        companyId: input.companyId,
        token: input.token,
      });
      if (!score) {
        checks.push({
          requirementType: 'jha',
          satisfied: false,
          reason: 'JHA service unavailable — cannot verify JHA',
          linkedId: input.jhaId,
        });
      } else {
        const satisfied = score.approved && !score.blockSubmission;
        checks.push({
          requirementType: 'jha',
          satisfied,
          reason: satisfied
            ? 'JHA approved and submission not blocked'
            : score.blockReasons.length
              ? score.blockReasons.join('; ')
              : 'JHA not approved or blocked',
          linkedId: input.jhaId,
          metadata: { riskScore: score.riskScore, status: score.status },
        });
      }
    } else {
      checks.push({
        requirementType: 'jha',
        satisfied: false,
        reason: 'JHA link required before approval',
      });
    }

    const workerId = input.workerId;
    if (workerId) {
      const training = await trainingClient.getWorkerTraining({
        workerId,
        companyId: input.companyId,
        token: input.token,
        role: input.workerRole,
      });
      if (!training) {
        checks.push({
          requirementType: 'training',
          satisfied: false,
          reason: 'Training service unavailable — cannot verify training',
          linkedId: workerId,
        });
      } else {
        const satisfied = training.compliant && training.missingRequired.length === 0;
        checks.push({
          requirementType: 'training',
          satisfied,
          reason: satisfied
            ? 'Worker training current'
            : training.missingRequired.length
              ? `Missing required training: ${training.missingRequired.join(', ')}`
              : `${training.expiredCount} expired training record(s)`,
          linkedId: workerId,
          metadata: {
            expiredCount: training.expiredCount,
            missingRequired: training.missingRequired,
          },
        });
      }

      const sds = await sdsClient.getWorkerSds({
        workerId,
        companyId: input.companyId,
        token: input.token,
      });
      if (!sds) {
        checks.push({
          requirementType: 'sds',
          satisfied: false,
          reason: 'SDS service unavailable — cannot verify SDS acknowledgements',
          linkedId: workerId,
        });
      } else {
        checks.push({
          requirementType: 'sds',
          satisfied: sds.acknowledged,
          reason: sds.acknowledged
            ? 'All required SDS documents acknowledged'
            : `${sds.pendingCount} SDS acknowledgement(s) pending`,
          linkedId: workerId,
          metadata: { pendingCount: sds.pendingCount },
        });
      }
    } else {
      checks.push({
        requirementType: 'training',
        satisfied: false,
        reason: 'Worker required for training verification',
      });
      checks.push({
        requirementType: 'sds',
        satisfied: false,
        reason: 'Worker required for SDS verification',
      });
    }

    if (input.equipmentId) {
      checks.push({
        requirementType: 'equipment_cert',
        satisfied: true,
        reason: 'Equipment certification recorded on permit',
        linkedId: input.equipmentId,
        metadata: { verifiedLocally: true },
      });
    } else {
      checks.push({
        requirementType: 'equipment_cert',
        satisfied: false,
        reason: 'Equipment certification link required',
      });
    }

    if (input.hazardId && input.controlId) {
      const [hazard, control] = await Promise.all([
        hazardControlClient.getHazard({
          hazardId: input.hazardId,
          companyId: input.companyId,
          token: input.token,
        }),
        hazardControlClient.getControl({
          controlId: input.controlId,
          companyId: input.companyId,
          token: input.token,
        }),
      ]);

      if (!hazard || !control) {
        checks.push({
          requirementType: 'hazard_control',
          satisfied: false,
          reason: 'Hazard control service unavailable — cannot verify controls',
          linkedId: input.controlId,
        });
      } else {
        const satisfied = hazard.active && control.effective;
        checks.push({
          requirementType: 'hazard_control',
          satisfied,
          reason: satisfied
            ? 'Hazard active with effective control in place'
            : !hazard.active
              ? 'Hazard is mitigated or closed'
              : 'Control not effective or not active',
          linkedId: input.controlId,
          metadata: { hazardId: input.hazardId },
        });
      }
    } else {
      checks.push({
        requirementType: 'hazard_control',
        satisfied: false,
        reason: 'Hazard and control links required before approval',
      });
    }

    if (input.pmTaskId) {
      const task = await pmTaskClient.getTask({
        taskId: input.pmTaskId,
        companyId: input.companyId,
        token: input.token,
      });
      if (task && task.exists === false) {
        const hazardIdx = checks.findIndex((c) => c.requirementType === 'hazard_control');
        if (hazardIdx >= 0) {
          checks[hazardIdx] = {
            ...checks[hazardIdx],
            satisfied: false,
            reason: 'Linked PM task not found',
          };
        }
      }
    }

    const blockReasons = checks.filter((c) => !c.satisfied).map((c) => c.reason);
    const passed = input.requireAll === false
      ? checks.some((c) => c.satisfied)
      : blockReasons.length === 0;

    return { passed, checks, blockReasons };
  }
}

export const safetyGateEngine = new SafetyGateEngine();
