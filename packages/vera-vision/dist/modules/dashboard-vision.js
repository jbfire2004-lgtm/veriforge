"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVisionDashboard = buildVisionDashboard;
function buildVisionDashboard(recent) {
    const fraudAlerts = recent.filter((r) => r.fraud.score >= 50).length;
    const expiredDocuments = recent.filter((r) => r.validation.issues.some((i) => i.includes("expired"))).length;
    const highRiskInspections = recent.filter((r) => r.module === "inspection" && (r.visual.hazards.length > 0 || r.fraud.score >= 40)).length;
    const missingDocuments = recent.filter((r) => r.validation.issues.length > 2).length;
    const autoMapped = recent.filter((r) => r.mappings.length > 0).length;
    const requiresReview = recent.filter((r) => r.reviewRequired).length;
    return {
        generatedAt: new Date().toISOString(),
        documentBacklog: recent.filter((r) => r.reviewRequired).length,
        fraudAlerts,
        expiredDocuments,
        highRiskInspections,
        missingDocuments,
        autoMapped,
        requiresReview,
        recent: recent.slice(0, 20),
    };
}
//# sourceMappingURL=dashboard-vision.js.map