import type { HazardScoreResult } from '../types';

export class HazardScoringEngine {
  score(severity: number, likelihood: number): HazardScoreResult {
    const riskScore = severity * likelihood;
    const sifPotential = riskScore >= 16 || (severity >= 4 && likelihood >= 4);

    let hecaCategory = 'routine';
    if (riskScore >= 20) hecaCategory = 'sif_precursor';
    else if (riskScore >= 12) hecaCategory = 'high_potential';
    else if (riskScore >= 9) hecaCategory = 'elevated';

    return { sifPotential, hecaCategory };
  }
}

export const hazardScoringEngine = new HazardScoringEngine();
