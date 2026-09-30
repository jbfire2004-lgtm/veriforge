"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionEngine = void 0;
class FraudDetectionEngine {
    analyze(fullText, fields) {
        const signals = [];
        if (fields.length < 3) {
            signals.push({
                code: "MISSING_FIELDS",
                message: "Too few extractable fields — possible low-quality or fraudulent document",
                severity: "medium",
                confidence: 0.7,
            });
        }
        const issue = fields.find((f) => f.key === "issueDate")?.value;
        const expiry = fields.find((f) => f.key === "expiryDate")?.value;
        if (issue && expiry && new Date(issue) > new Date(expiry)) {
            signals.push({
                code: "INVALID_DATES",
                message: "Issue date is after expiry date",
                severity: "high",
                confidence: 0.9,
            });
        }
        if (/photoshop|edited|sample|template|lorem ipsum/i.test(fullText)) {
            signals.push({
                code: "TEMPLATE_MARKERS",
                message: "Template or editing markers detected in text",
                severity: "high",
                confidence: 0.85,
            });
        }
        if (/font-family|opacity:|transform:/i.test(fullText)) {
            signals.push({
                code: "DIGITAL_ARTIFACTS",
                message: "Digital overlay artifacts suggest manipulation",
                severity: "critical",
                confidence: 0.8,
            });
        }
        const names = fields.filter((f) => f.key.includes("Name"));
        const uniqueFonts = new Set(names.map((n) => n.value.length % 7));
        if (names.length >= 2 && uniqueFonts.size === names.length && names.every((n) => n.value.length > 20)) {
            signals.push({
                code: "FONT_INCONSISTENCY",
                message: "Unusual name field patterns — possible font mismatch",
                severity: "medium",
                confidence: 0.55,
            });
        }
        if (!fields.some((f) => f.key === "providerName") && !/provider|training/i.test(fullText)) {
            signals.push({
                code: "MISSING_PROVIDER",
                message: "No provider identified on certificate",
                severity: "medium",
                confidence: 0.65,
            });
        }
        const worker = fields.find((f) => f.key === "workerName")?.value;
        if (worker && /test|sample|xxx|asdf/i.test(worker)) {
            signals.push({
                code: "SUSPICIOUS_WORKER_NAME",
                message: "Worker name appears placeholder or invalid",
                severity: "high",
                confidence: 0.75,
            });
        }
        const score = Math.min(100, signals.reduce((s, sig) => s + severityWeight(sig.severity) * sig.confidence * 25, 0));
        return { score, signals };
    }
}
exports.FraudDetectionEngine = FraudDetectionEngine;
function severityWeight(s) {
    switch (s) {
        case "critical":
            return 4;
        case "high":
            return 3;
        case "medium":
            return 2;
        default:
            return 1;
    }
}
//# sourceMappingURL=fraud-detection.js.map