import type { CommandContextInput } from "../types";
export declare function ingestRealtimePhases(ctx: CommandContextInput): {
    safety: import("@vera/autonomous-safety").AutonomousSafetyReport;
    scheduling: import("@vera/predictive-scheduling").PredictiveSchedulingReport;
    enterprise: import("@vera/enterprise-automation").EnterpriseAutomationReport;
};
//# sourceMappingURL=phase-realtime.d.ts.map