export type ScoreComponent = {
  key: string;
  weight: number;
  value: number;
  deduction: number;
};

export type ScoreResult = {
  score: number;
  maxScore: number;
  components: ScoreComponent[];
};

export class CailScoringEngine {
  workerSafetyScore(input: {
    profileScore: number;
    overdueCapa: number;
    denials30d: number;
    sifExposures: number;
  }): ScoreResult {
    const components: ScoreComponent[] = [];
    let score = input.profileScore || 75;

    if (input.overdueCapa > 0) {
      const d = Math.min(30, input.overdueCapa * 10);
      score -= d;
      components.push({
        key: 'overdue_capa',
        weight: 0.35,
        value: input.overdueCapa,
        deduction: d,
      });
    }
    if (input.denials30d > 0) {
      const d = Math.min(20, input.denials30d * 4);
      score -= d;
      components.push({
        key: 'access_denials',
        weight: 0.25,
        value: input.denials30d,
        deduction: d,
      });
    }
    if (input.sifExposures > 0) {
      const d = Math.min(25, input.sifExposures * 8);
      score -= d;
      components.push({
        key: 'sif_exposure',
        weight: 0.3,
        value: input.sifExposures,
        deduction: d,
      });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      maxScore: 100,
      components,
    };
  }

  equipmentSafetyScore(input: {
    safetyStatus: string;
    lockoutStatus: string;
    openCapa: number;
    failures90d: number;
  }): ScoreResult {
    let score = 100;
    const components: ScoreComponent[] = [];

    if (input.safetyStatus !== 'OK') {
      score -= 40;
      components.push({
        key: 'safety_status',
        weight: 0.4,
        value: 1,
        deduction: 40,
      });
    }
    if (input.lockoutStatus !== 'CLEAR') {
      score -= 35;
      components.push({
        key: 'lockout',
        weight: 0.35,
        value: 1,
        deduction: 35,
      });
    }
    if (input.openCapa > 0) {
      const d = Math.min(25, input.openCapa * 12);
      score -= d;
      components.push({
        key: 'open_capa',
        weight: 0.25,
        value: input.openCapa,
        deduction: d,
      });
    }
    if (input.failures90d > 0) {
      const d = Math.min(15, input.failures90d * 5);
      score -= d;
      components.push({
        key: 'failures',
        weight: 0.15,
        value: input.failures90d,
        deduction: d,
      });
    }

    return { score: Math.max(0, Math.round(score)), maxScore: 100, components };
  }

  projectSafetyScore(input: {
    openCapa: number;
    overdueCapa: number;
    criticalHazards: number;
    openIncidents: number;
    closureRate: number;
  }): ScoreResult {
    let score = 100;
    const components: ScoreComponent[] = [];

    score -= Math.min(25, input.overdueCapa * 8);
    if (input.overdueCapa > 0) {
      components.push({
        key: 'overdue_capa',
        weight: 0.3,
        value: input.overdueCapa,
        deduction: Math.min(25, input.overdueCapa * 8),
      });
    }
    score -= Math.min(20, input.criticalHazards * 10);
    if (input.criticalHazards > 0) {
      components.push({
        key: 'critical_hazards',
        weight: 0.25,
        value: input.criticalHazards,
        deduction: Math.min(20, input.criticalHazards * 10),
      });
    }
    score -= Math.min(15, input.openIncidents * 7);
    if (input.openIncidents > 0) {
      components.push({
        key: 'incidents',
        weight: 0.2,
        value: input.openIncidents,
        deduction: Math.min(15, input.openIncidents * 7),
      });
    }
    score -= Math.max(0, 50 - input.closureRate) * 0.3;
    components.push({
      key: 'closure_rate',
      weight: 0.25,
      value: input.closureRate,
      deduction: Math.max(0, 50 - input.closureRate) * 0.3,
    });

    return { score: Math.max(0, Math.round(score)), maxScore: 100, components };
  }

  companySafetyScore(projectScores: number[]): ScoreResult {
    if (projectScores.length === 0) {
      return {
        score: 100,
        maxScore: 100,
        components: [{ key: 'no_projects', weight: 1, value: 0, deduction: 0 }],
      };
    }
    const avg = projectScores.reduce((a, b) => a + b, 0) / projectScores.length;
    const min = Math.min(...projectScores);
    const score = Math.round(avg * 0.7 + min * 0.3);
    return {
      score: Math.max(0, Math.min(100, score)),
      maxScore: 100,
      components: [
        { key: 'avg_project', weight: 0.7, value: avg, deduction: 100 - avg },
        { key: 'worst_project', weight: 0.3, value: min, deduction: 100 - min },
      ],
    };
  }

  hazardSeverityScore(
    severity: number,
    sifPotential: boolean,
    controlCount: number,
  ): ScoreResult {
    let score = Math.min(100, severity * 20);
    if (sifPotential) score = Math.min(100, score + 25);
    if (controlCount === 0) score = Math.min(100, score + 20);
    return {
      score: Math.round(score),
      maxScore: 100,
      components: [
        { key: 'severity', weight: 0.5, value: severity, deduction: 0 },
        { key: 'sif', weight: 0.3, value: sifPotential ? 1 : 0, deduction: 0 },
        { key: 'controls', weight: 0.2, value: controlCount, deduction: 0 },
      ],
    };
  }

  controlStrengthScore(
    effectiveness: number,
    mapped: boolean,
    verified: boolean,
  ): ScoreResult {
    let score = effectiveness * 20;
    if (!mapped) score *= 0.5;
    if (!verified) score *= 0.8;
    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      maxScore: 100,
      components: [
        {
          key: 'effectiveness',
          weight: 0.6,
          value: effectiveness,
          deduction: 0,
        },
        { key: 'mapped', weight: 0.2, value: mapped ? 1 : 0, deduction: 0 },
        { key: 'verified', weight: 0.2, value: verified ? 1 : 0, deduction: 0 },
      ],
    };
  }
}
