import type { CommandAlert, CommandContextInput, RiskAssessment } from "../types";
export declare class CommandAlertingEngine {
    generate(ctx: CommandContextInput, risks: RiskAssessment[], intelligence: {
        hazards: string[];
        complianceFailures: string[];
        operationalFailures: string[];
    }): CommandAlert[];
}
//# sourceMappingURL=alerting.d.ts.map