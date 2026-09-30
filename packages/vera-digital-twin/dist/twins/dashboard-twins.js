"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTwinDashboard = buildTwinDashboard;
function buildTwinDashboard(twins) {
    const workers = twins.filter((t) => t.type === "worker");
    const equipment = twins.filter((t) => t.type === "equipment");
    const projects = twins.filter((t) => t.type === "project");
    const companies = twins.filter((t) => t.type === "company");
    const providers = twins.filter((t) => t.type === "provider");
    const halls = twins.filter((t) => t.type === "unionHall");
    const avg = (arr, pick) => arr.length ? arr.reduce((s, t) => s + pick(t), 0) / arr.length : 0;
    const anomalies = twins
        .filter((t) => t.risk.level === "high" || t.risk.level === "critical")
        .slice(0, 10)
        .map((t) => ({
        entityType: t.type,
        entityId: t.id,
        message: `${t.name} risk ${t.risk.level} (${t.risk.score})`,
    }));
    const predictions = twins.flatMap((t) => t.predictions).slice(0, 12);
    return {
        generatedAt: new Date().toISOString(),
        workers: {
            total: workers.length,
            atRisk: workers.filter((w) => w.risk.score >= 60).length,
            avgReadiness: Math.round(avg(workers, (w) => w.readiness.score)),
        },
        equipment: {
            total: equipment.length,
            lockedOut: equipment.filter((e) => e.type === "equipment" && e.lockedOut).length,
            avgReadiness: Math.round(avg(equipment, (e) => e.readiness.score)),
        },
        projects: {
            total: projects.length,
            notReady: projects.filter((p) => p.readiness.score < 70).length,
            avgReadiness: Math.round(avg(projects, (p) => p.readiness.score)),
        },
        companies: {
            total: companies.length,
            avgCompliance: Math.round(avg(companies, (c) => c.compliance.score)),
        },
        providers: {
            total: providers.length,
            pendingApproval: providers.filter((p) => p.type === "provider" && !p.approved).length,
        },
        unionHalls: {
            total: halls.length,
            dispatchReady: halls.reduce((s, h) => s + (h.type === "unionHall" ? h.readyForDispatch : 0), 0),
        },
        anomalies,
        predictions,
    };
}
//# sourceMappingURL=dashboard-twins.js.map