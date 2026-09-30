"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProvider = analyzeProvider;
function analyzeProvider(input, engines) {
    const reliability = engines.risk.toReadiness(engines.risk.score([
        { id: "approved", label: "Approved", weight: 30, value: input.approved ? 0 : 70 },
        { id: "reject", label: "Rejection rate", weight: 25, value: Math.min(100, input.rejectionRate * 100) },
        { id: "instructor", label: "Instructor validity", weight: 25, value: input.instructorValid ? 0 : 80 },
        { id: "standards", label: "Standards match", weight: 20, value: input.standardsMismatch ? 75 : 0 },
    ]));
    if (!input.instructorValid) {
        engines.anomaly.report({
            module: "provider",
            code: "INVALID_INSTRUCTOR",
            message: `Invalid instructor on provider ${input.name}`,
            severity: "high",
            entityId: input.id,
        });
    }
    return {
        id: input.id,
        name: input.name,
        reliability,
        instructorScore: input.instructorValid ? 90 : 30,
        courseQuality: Math.min(100, 50 + input.courseCount * 5),
        approvalForecast: input.daysToApproval != null
            ? { days: input.daysToApproval, likely: input.daysToApproval <= 14 }
            : undefined,
        summary: engines.summarize.summarize(`Provider ${input.name}`, [
            `Reliability ${reliability.score}/100`,
            input.approved ? "Approved" : "Pending approval",
        ]),
    };
}
//# sourceMappingURL=provider-intelligence.js.map