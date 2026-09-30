import type { HecaAnalysis, SafetyContextInput, SafetyIntervention, SifAnalysis, EnergyWheelAnalysis } from "../types";
export declare class SafetyInterventionEngine {
    private interventions;
    evaluate(ctx: SafetyContextInput, sif: SifAnalysis, heca: HecaAnalysis, energy: EnergyWheelAnalysis): SafetyIntervention[];
    getAll(): SafetyIntervention[];
    private add;
    private prioritize;
}
//# sourceMappingURL=safety-intervention.d.ts.map