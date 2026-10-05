export type ControlRow = {
    controlType: string;
    adequate: boolean | null;
    effectivenessScore: number | null;
    verified: boolean;
    ppeRequired: boolean;
};
export type ControlEvaluationOutput = {
    controlStrength: number;
    missingControls: number;
    weakControls: number;
    ineffectiveControls: number;
    findings: string[];
};
export declare class ControlEffectivenessEngine {
    evaluate(hazardRiskScore: number, controls: ControlRow[]): ControlEvaluationOutput;
}
