import { PmUnifiedControlType } from '@prisma/client';

export type MappingValidation = {
  complete: boolean;
  missing: string[];
  weakControls: string[];
  requiredJhaControls: string[];
  requiredInspectionItems: string[];
};

export class HazardControlMappingEngine {
  validateMapping(input: {
    hazardTitle: string;
    linkedControlCount: number;
    ppeCount: number;
    trainingCount: number;
    weakIssues: string[];
    sifPotential: boolean;
  }): MappingValidation {
    const missing: string[] = [];
    if (input.linkedControlCount === 0)
      missing.push('No controls mapped to hazard');
    if (input.sifPotential && input.trainingCount === 0) {
      missing.push('SIF-potential hazard requires training mapping');
    }
    if (input.ppeCount === 0 && input.sifPotential) {
      missing.push('Consider PPE mapping for high-risk hazard');
    }

    return {
      complete: missing.length === 0 && input.weakIssues.length === 0,
      missing,
      weakControls: input.weakIssues,
      requiredJhaControls: input.linkedControlCount
        ? [`JHA: document controls for ${input.hazardTitle}`]
        : [],
      requiredInspectionItems: input.linkedControlCount
        ? [`Inspection: verify controls for ${input.hazardTitle}`]
        : [`Inspection: identify controls for ${input.hazardTitle}`],
    };
  }

  hierarchyRank(type: PmUnifiedControlType): number {
    const ranks: Record<PmUnifiedControlType, number> = {
      engineering: 1,
      administrative: 2,
      procedural: 3,
      equipment: 3,
      ppe: 5,
    };
    return ranks[type] ?? 4;
  }
}
