import type { AutonomousSafetyReport, SafetyAutomationOutput } from "../types";
export declare class SafetyAutomationEngine {
    generate(partial: Pick<AutonomousSafetyReport, "context" | "sif" | "heca" | "energyWheel" | "rootCause" | "interventions">): SafetyAutomationOutput;
}
//# sourceMappingURL=safety-automation.d.ts.map