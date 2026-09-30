import { sifHecaScoringEngine } from './sif-heca-scoring.engine';
import type { JhaScoreResult } from '../types';

type HazardRow = {
  severity: number;
  likelihood: number;
  sifPotential: boolean;
  hecaCategory: string;
};

type ControlRow = {
  controlStrength: number;
};

export class JhaScoringEngine {
  computeHazardRisk(severity: number, likelihood: number): number {
    return Math.min(25, severity * likelihood);
  }

  evaluate(input: {
    jhaId: string;
    version: number;
    hazards: HazardRow[];
    controls: ControlRow[];
    signatureCount: number;
    requiredWorkerCount?: number;
  }): JhaScoreResult {
    const missingControls: string[] = [];
    const weakControls: string[] = [];
    const blockReasons: string[] = [];

    let maxSeverity = 0;
    let maxLikelihood = 0;
    let maxRisk = 0;
    let sifIndicators = 0;
    let worstHeca = 'routine';

    const hecaRank: Record<string, number> = {
      routine: 0,
      elevated: 1,
      high_potential: 2,
      sif_precursor: 3,
    };

    for (const h of input.hazards) {
      const risk = this.computeHazardRisk(h.severity, h.likelihood);
      maxRisk = Math.max(maxRisk, risk);
      maxSeverity = Math.max(maxSeverity, h.severity);
      maxLikelihood = Math.max(maxLikelihood, h.likelihood);
      if (h.sifPotential || risk >= 20) sifIndicators++;
      if ((hecaRank[h.hecaCategory] ?? 0) > (hecaRank[worstHeca] ?? 0)) {
        worstHeca = h.hecaCategory;
      }
    }

    const hazardCount = input.hazards.length;
    const controlCount = input.controls.length;

    if (hazardCount > 0 && controlCount === 0) {
      missingControls.push('No controls mapped to JHA hazards');
    }

    for (const h of input.hazards) {
      const risk = this.computeHazardRisk(h.severity, h.likelihood);
      if (risk >= 12 && controlCount === 0) {
        missingControls.push(`High-risk hazard (severity ${h.severity}) needs controls`);
      }
    }

    for (const c of input.controls) {
      if (c.controlStrength < 3) {
        weakControls.push(`Control strength ${c.controlStrength} below adequate threshold`);
      }
    }

    const highEnergyCount = input.hazards.filter((h) => h.sifPotential).length;
    const aggregate = sifHecaScoringEngine.score({
      severity: maxSeverity || 1,
      likelihood: maxLikelihood || 1,
      sifPotential: sifIndicators > 0,
      highEnergyCount,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });

    if (input.hazards.length === 0) {
      blockReasons.push('At least one hazard is required');
    }
    if (missingControls.length > 0) {
      blockReasons.push('Missing required controls');
    }
    if (input.requiredWorkerCount && input.signatureCount < input.requiredWorkerCount) {
      blockReasons.push('Not all workers have signed');
    }

    return {
      jhaId: input.jhaId,
      version: input.version,
      hazardCount,
      controlCount,
      signatureCount: input.signatureCount,
      riskScore: maxRisk,
      sifScore: aggregate.sifScore,
      sifPotential: aggregate.sifPotential || sifIndicators > 0,
      hecaCategory: worstHeca !== 'routine' ? worstHeca : aggregate.hecaCategory,
      supervisorReviewRequired: aggregate.supervisorReviewRequired,
      requireCapa: aggregate.requireCapa || missingControls.length > 0,
      explanation: aggregate.explanation,
      missingControls,
      weakControls,
      blockSubmission: blockReasons.length > 0,
      blockReasons,
    };
  }
}

export const jhaScoringEngine = new JhaScoringEngine();
