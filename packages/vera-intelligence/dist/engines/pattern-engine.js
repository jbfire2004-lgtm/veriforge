"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternRecognitionEngine = void 0;
class PatternRecognitionEngine {
    detectRepeatedFailures(events, threshold = 3, windowDays = 90) {
        const cutoff = Date.now() - windowDays * 86400000;
        const failures = events.filter((e) => e.type.includes("fail") && new Date(e.at).getTime() >= cutoff);
        if (failures.length < threshold)
            return null;
        return {
            patternId: "repeated_failures",
            label: "Repeated failures",
            confidence: Math.min(0.99, 0.5 + failures.length * 0.1),
            evidence: failures.slice(-5).map((e) => e.at),
        };
    }
    detectComplianceDrop(rates, dropThreshold = 15) {
        if (rates.length < 2)
            return null;
        const sorted = [...rates].sort((a, b) => a.at.localeCompare(b.at));
        const latest = sorted[sorted.length - 1];
        const prev = sorted[sorted.length - 2];
        const drop = prev.rate - latest.rate;
        if (drop < dropThreshold)
            return null;
        return {
            patternId: "compliance_drop",
            label: "Sudden compliance drop",
            confidence: Math.min(0.95, drop / 100 + 0.4),
            evidence: [`${prev.rate}% → ${latest.rate}%`],
        };
    }
    detectExpiryCluster(expiryDates, clusterWindowDays = 14) {
        if (expiryDates.length < 3)
            return null;
        const sorted = expiryDates.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
        let cluster = 1;
        for (let i = 1; i < sorted.length; i++) {
            if ((sorted[i] - sorted[i - 1]) / 86400000 <= clusterWindowDays)
                cluster++;
            else
                cluster = 1;
            if (cluster >= 3) {
                return {
                    patternId: "expiry_cluster",
                    label: "Expiry cluster detected",
                    confidence: 0.75,
                    evidence: [`${cluster} items expiring within ${clusterWindowDays}d`],
                };
            }
        }
        return null;
    }
}
exports.PatternRecognitionEngine = PatternRecognitionEngine;
//# sourceMappingURL=pattern-engine.js.map