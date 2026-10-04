export type ExplainabilityInput = {
  targetType: string;
  targetId: string;
  summary: string;
  why: Record<string, unknown>;
  dataSources: string[];
  hazardFactors: string[];
  controlFactors: string[];
  workerFactors: string[];
  equipmentFactors: string[];
  projectFactors: string[];
  confidence: number;
  recommendedActions: string[];
};

export type ExplainabilityOutput = ExplainabilityInput & {
  humanReadable: string;
};

export class CailExplainabilityEngine {
  build(input: ExplainabilityInput): ExplainabilityOutput {
    const sections: string[] = [input.summary, ''];

    if (input.hazardFactors.length) {
      sections.push(`Hazards: ${input.hazardFactors.join('; ')}`);
    }
    if (input.controlFactors.length) {
      sections.push(`Controls: ${input.controlFactors.join('; ')}`);
    }
    if (input.workerFactors.length) {
      sections.push(`Workers: ${input.workerFactors.join('; ')}`);
    }
    if (input.equipmentFactors.length) {
      sections.push(`Equipment: ${input.equipmentFactors.join('; ')}`);
    }
    if (input.projectFactors.length) {
      sections.push(`Project: ${input.projectFactors.join('; ')}`);
    }
    if (input.dataSources.length) {
      sections.push(`Data sources: ${input.dataSources.join(', ')}`);
    }
    sections.push(`Confidence: ${Math.round(input.confidence * 100)}%`);
    if (input.recommendedActions.length) {
      sections.push(`Recommended: ${input.recommendedActions.join(' → ')}`);
    }

    return {
      ...input,
      humanReadable: sections.join('\n'),
    };
  }

  forPrediction(
    predictionType: string,
    probability: number,
    factors: string[],
    dataSources: string[],
  ): ExplainabilityInput {
    return {
      targetType: 'prediction',
      targetId: predictionType,
      summary: `${predictionType.replace(/_/g, ' ')} probability ${Math.round(
        probability * 100,
      )}%`,
      why: { factors, probability },
      dataSources,
      hazardFactors: factors.filter(
        (f) => f.includes('hazard') || f.includes('sif'),
      ),
      controlFactors: factors.filter((f) => f.includes('control')),
      workerFactors: factors.filter(
        (f) =>
          f.includes('worker') ||
          f.includes('training') ||
          f.includes('access'),
      ),
      equipmentFactors: factors.filter((f) => f.includes('equipment')),
      projectFactors: factors.filter(
        (f) =>
          f.includes('project') || f.includes('capa') || f.includes('incident'),
      ),
      confidence: Math.min(0.98, 0.65 + factors.length * 0.05),
      recommendedActions: this.defaultActions(predictionType),
    };
  }

  private defaultActions(predictionType: string): string[] {
    const map: Record<string, string[]> = {
      incident_likelihood: ['Supervisor review', 'Increase field presence'],
      equipment_failure: ['Pre-use inspection', 'Maintenance work order'],
      capa_overdue: ['Escalation sweep', 'Reassign primary owner'],
      project_risk: ['Project safety meeting', 'Critical CAPA blitz'],
      training_lapse: ['Schedule training', 'Restrict zone access'],
    };
    return map[predictionType] ?? ['Review with safety officer'];
  }
}
