import type { SifHecaResult } from '../types';

export type SifHecaInput = {
  severity: number;
  likelihood: number;
  sifPotential?: boolean;
  highEnergyCount: number;
  openCapaCount: number;
  priorIncidentCount: number;
};

export class SifHecaScoringEngine {
  score(input: SifHecaInput): SifHecaResult {
    const riskScore = input.severity * input.likelihood;
    let sifScore = riskScore;
    if (input.highEnergyCount >= 2) sifScore += 4;
    if (input.priorIncidentCount > 0) sifScore += 3;
    if (input.openCapaCount > 0) sifScore += 2;

    const sifPotential =
      !!input.sifPotential || sifScore >= 16 || (input.severity >= 4 && input.likelihood >= 4);

    let hecaCategory = 'routine';
    if (sifScore >= 20) hecaCategory = 'sif_precursor';
    else if (sifScore >= 12) hecaCategory = 'high_potential';
    else if (riskScore >= 9) hecaCategory = 'elevated';

    const supervisorReviewRequired = sifPotential || input.severity >= 4;
    const requireCapa = sifPotential || input.openCapaCount > 2;

    const explanation: string[] = [
      `Risk score ${riskScore} (severity ${input.severity} × likelihood ${input.likelihood})`,
    ];
    if (input.highEnergyCount >= 2) {
      explanation.push('Multiple high-energy sources increase SIF exposure');
    }
    if (sifPotential) explanation.push('Classified as SIF-potential incident');

    return {
      riskScore,
      sifScore,
      sifPotential,
      hecaCategory,
      supervisorReviewRequired,
      requireCapa,
      explanation,
    };
  }
}

export const sifHecaScoringEngine = new SifHecaScoringEngine();

export const SEVERITY_TO_LEVEL: Record<string, number> = {
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

export function defaultLikelihoodForSeverity(severity: string): number {
  switch (severity) {
    case 'critical':
      return 5;
    case 'high':
      return 4;
    case 'medium':
      return 3;
    default:
      return 2;
  }
}
