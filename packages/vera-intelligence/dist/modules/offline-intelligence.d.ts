import type { IntelligenceBundle, IntelligenceContext } from "../types";
/** Lightweight intelligence for field/offline mode (no server round-trip required). */
export declare function analyzeOffline(ctx: IntelligenceContext & {
    qrPayload?: string;
    complianceOk?: boolean;
    readinessFactors?: {
        label: string;
        value: number;
    }[];
}): {
    qrIntelligence: {
        payload: string;
        verified: boolean;
    } | null;
    complianceCheck: {
        ok: boolean;
    };
    riskScore: import("../types").ScoreResult;
    readiness: import("../types").ScoreResult;
    anomalies: import("../types").Anomaly[];
    summary: import("../types").SummaryResult;
    classification: import("../types").ClassificationResult | undefined;
};
export declare function mergeOfflineWithBundle(offline: ReturnType<typeof analyzeOffline>, bundle: IntelligenceBundle): IntelligenceBundle;
//# sourceMappingURL=offline-intelligence.d.ts.map