import { PmCorrectiveActionType } from '@prisma/client';

export type GenerationTrigger = {
  sourceModule: string;
  sourceId: string;
  sourceItemId?: string;
  title: string;
  description?: string;
  actionType: PmCorrectiveActionType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  hazardId?: string;
  controlId?: string;
  equipmentId?: number;
  workerId?: number;
  sifLinked?: boolean;
  hecaLinked?: boolean;
  verificationRole: string;
  linkTypes: Array<{ linkType: string; linkedId: string }>;
};

export class CapaGenerationEngine {
  classify(input: {
    severity: string;
    sifLinked?: boolean;
    equipmentUnsafe?: boolean;
    trainingExpired?: boolean;
    accessDenied?: boolean;
  }): { priority: string; verificationRole: string; escalationHint: number } {
    let priority = 'medium';
    let verificationRole = 'supervisor';
    let escalationHint = 1;

    if (input.sifLinked || input.severity === 'critical') {
      priority = 'critical';
      verificationRole = 'safety_officer';
      escalationHint = 3;
    } else if (input.severity === 'high' || input.equipmentUnsafe) {
      priority = 'high';
      verificationRole = 'safety_officer';
      escalationHint = 2;
    } else if (input.trainingExpired || input.accessDenied) {
      priority = 'high';
      verificationRole = 'supervisor';
      escalationHint = 2;
    }

    return { priority, verificationRole, escalationHint };
  }

  buildTrigger(
    partial: Partial<GenerationTrigger> &
      Pick<GenerationTrigger, 'sourceModule' | 'sourceId' | 'title'>,
  ): GenerationTrigger {
    const severity = partial.severity ?? 'medium';
    const classified = this.classify({
      severity,
      sifLinked: partial.sifLinked,
      equipmentUnsafe: !!partial.equipmentId,
    });
    return {
      sourceModule: partial.sourceModule,
      sourceId: partial.sourceId,
      sourceItemId: partial.sourceItemId,
      title: partial.title,
      description: partial.description,
      actionType: partial.actionType ?? 'permanent',
      severity,
      hazardId: partial.hazardId,
      controlId: partial.controlId,
      equipmentId: partial.equipmentId,
      workerId: partial.workerId,
      sifLinked: partial.sifLinked,
      hecaLinked: partial.hecaLinked,
      verificationRole: classified.verificationRole,
      linkTypes: partial.linkTypes ?? [],
    };
  }
}
