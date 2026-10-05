import type { JhaFlhaEngineInput, JhaFlhaEngineOutput } from './jha-flha-engine.types';
export declare class JhaFlhaEngineService {
    generate(input: JhaFlhaEngineInput): JhaFlhaEngineOutput;
    private normalizeSteps;
    private buildContextText;
    private hazardCategory;
    private hierarchyFromControlType;
    private applyEnvironmentHazards;
    private applyEquipmentHazards;
    private applyCriticalRisks;
    private buildEnergyWheel;
    private failureModesForEnergy;
    private buildFieldSummary;
    private buildVerificationQuestions;
    private dedupeHazards;
    private dedupeControls;
}
