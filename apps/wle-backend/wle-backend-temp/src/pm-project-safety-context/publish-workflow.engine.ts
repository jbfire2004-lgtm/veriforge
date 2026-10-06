import { PmProjectSafetyPublishStatus } from '@prisma/client';

export type PublishTransition = {
  allowed: boolean;
  nextStatus: PmProjectSafetyPublishStatus;
  errors: string[];
};

export class PublishWorkflowEngine {
  profilePublish(
    current: PmProjectSafetyPublishStatus,
    hasRequiredFields: boolean,
  ): PublishTransition {
    const errors: string[] = [];
    if (!hasRequiredFields)
      errors.push('Profile missing required configuration');
    if (current === 'archived') {
      return {
        allowed: false,
        nextStatus: current,
        errors: ['Cannot publish archived profile'],
      };
    }
    return {
      allowed: errors.length === 0,
      nextStatus: 'published',
      errors,
    };
  }

  hazardPublish(
    current: PmProjectSafetyPublishStatus,
    title: string,
    description: string,
  ): PublishTransition {
    const errors: string[] = [];
    if (!title?.trim()) errors.push('Hazard title required');
    if (!description?.trim()) errors.push('Hazard description required');
    return {
      allowed: errors.length === 0 && current !== 'archived',
      nextStatus: 'published',
      errors,
    };
  }

  controlPublish(
    current: PmProjectSafetyPublishStatus,
    title: string,
    description: string,
  ): PublishTransition {
    const errors: string[] = [];
    if (!title?.trim()) errors.push('Control title required');
    if (!description?.trim()) errors.push('Control description required');
    return {
      allowed: errors.length === 0 && current !== 'archived',
      nextStatus: 'published',
      errors,
    };
  }

  archive(current: PmProjectSafetyPublishStatus): PublishTransition {
    if (current === 'draft') {
      return {
        allowed: false,
        nextStatus: current,
        errors: ['Cannot archive draft'],
      };
    }
    return { allowed: true, nextStatus: 'archived', errors: [] };
  }

  /** Spec workflow: Draft → Published → Enforced → Updated */
  mapWorkflowState(
    status: PmProjectSafetyPublishStatus,
    profilePublished: boolean,
    enforcementActive: boolean,
  ): 'draft' | 'published' | 'enforced' | 'updated' {
    if (status === 'draft') return 'draft';
    if (status === 'published' && enforcementActive) return 'enforced';
    if (status === 'published' && profilePublished) return 'published';
    if (status === 'archived') return 'updated';
    return 'published';
  }

  validatePublishReadiness(input: {
    publishedHazardCount: number;
    hazardsWithoutControls: number;
    zoneRuleCount: number;
    equipmentRuleKeys: number;
    trainingRuleKeys: number;
    emergencyRuleKeys: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (input.publishedHazardCount > 0 && input.hazardsWithoutControls > 0) {
      errors.push(
        `${input.hazardsWithoutControls} published hazard(s) missing linked controls`,
      );
    }
    if (input.zoneRuleCount === 0) {
      errors.push('At least one zone rule required');
    }
    if (input.equipmentRuleKeys === 0) {
      errors.push('Equipment rules must be defined on profile');
    }
    if (input.trainingRuleKeys === 0) {
      errors.push('Training requirements must be defined');
    }
    if (input.emergencyRuleKeys === 0) {
      errors.push('Emergency requirements must be defined');
    }
    return { valid: errors.length === 0, errors };
  }
}
