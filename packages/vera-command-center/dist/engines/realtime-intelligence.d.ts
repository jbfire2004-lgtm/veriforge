import type { CommandContextInput } from "../types";
export declare class RealtimeIntelligenceEngine {
    ingest(ctx: CommandContextInput): {
        anomalies: string[];
        hazards: string[];
        conflicts: string[];
        complianceFailures: string[];
        operationalFailures: string[];
        phases: {
            safety: import("@vera/autonomous-safety").AutonomousSafetyReport;
            scheduling: import("@vera/predictive-scheduling").PredictiveSchedulingReport;
            enterprise: import("@vera/enterprise-automation").EnterpriseAutomationReport;
        };
    };
}
//# sourceMappingURL=realtime-intelligence.d.ts.map