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
    if (sifPotential) explanation.push('Classified as SIF-potential hazard');

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
