export interface ProgramAssessmentResult {
  score: number;
  passed: boolean;
  missing: string[];
  matched: string[];
}

export class TrainingLegislationEngine {
  // Phase 1: simple keyword-based compliance rules
  private requiredKeywords = [
    'safety',
    'hazard',
    'ppe',
    'emergency',
    'procedure',
    'workplace',
    'certification',
  ];

  assessProgram(content: string): ProgramAssessmentResult {
    const lower = content.toLowerCase();

    const matched = this.requiredKeywords.filter((k) => lower.includes(k));

    const missing = this.requiredKeywords.filter((k) => !lower.includes(k));

    const score = Math.round(
      (matched.length / this.requiredKeywords.length) * 100,
    );

    return {
      score,
      passed: score >= 70,
      matched,
      missing,
    };
  }
}
