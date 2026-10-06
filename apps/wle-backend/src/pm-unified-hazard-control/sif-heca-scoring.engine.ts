export type SifHecaInput = {
  severity: number;
  likelihood: number;
  sifPotential?: boolean;
  highEnergyCount: number;
  openCapaCount: number;
  priorIncidentCount: number;
};

export type SifHecaResult = {
  riskScore: number;
  sifScore: number;
  sifPotential: boolean;
  hecaCategoryKey: string;
  supervisorReviewRequired: boolean;
  requireCapa: boolean;
  explanation: string[];
};

export class SifHecaScoringEngine {
  score(input: SifHecaInput): SifHecaResult {
    const riskScore = input.severity * input.likelihood;
    let sifScore = riskScore;
    if (input.highEnergyCount >= 2) sifScore += 4;
    if (input.priorIncidentCount > 0) sifScore += 3;
    if (input.openCapaCount > 0) sifScore += 2;

    const sifPotential =
      !!input.sifPotential ||
      sifScore >= 16 ||
      (input.severity >= 4 && input.likelihood >= 4);

    let hecaCategoryKey = 'routine';
    if (sifScore >= 20) hecaCategoryKey = 'sif_precursor';
    else if (sifScore >= 12) hecaCategoryKey = 'high_potential';
    else if (riskScore >= 9) hecaCategoryKey = 'elevated';

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
      hecaCategoryKey,
      supervisorReviewRequired,
      requireCapa,
      explanation,
    };
  }
}
