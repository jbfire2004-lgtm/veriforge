"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyAutomationEngine = void 0;
class SafetyAutomationEngine {
    generate(partial) {
        const ctx = partial.context;
        const sif = partial.sif;
        const heca = partial.heca;
        const ew = partial.energyWheel;
        const jhaRecommendations = [];
        const flhaRecommendations = [];
        for (const f of ctx.forms ?? []) {
            if (f.kind === "JHA" && !f.controlMeasures) {
                jhaRecommendations.push(`Add controls to JHA: ${f.title}`);
            }
            if (f.kind === "FLHA") {
                flhaRecommendations.push(`Review FLHA hazards for ${f.title}`);
            }
        }
        const energyWheelDiagram = ew.classifications
            .map((c) => `${c.energy}: ${c.hazards.join(", ") || "—"}`)
            .join(" | ");
        const alerts = [];
        if (sif.precursors.length)
            alerts.push(`${sif.precursors.length} SIF precursors active`);
        if (heca.violations.length)
            alerts.push(`${heca.violations.length} HECA violations`);
        if (ew.missingControls.length)
            alerts.push(`${ew.missingControls.length} missing energy controls`);
        return {
            jhaRecommendations,
            flhaRecommendations,
            sifReportSummary: `SIF risk ${sif.riskScore.score}/100 (${sif.riskScore.level}). ${sif.recommendations[0] ?? ""}`,
            hecaSummary: heca.summary,
            energyWheelDiagram: energyWheelDiagram || "No active energy classifications",
            correctiveActions: partial.rootCause.correctiveActions,
            alerts,
        };
    }
}
exports.SafetyAutomationEngine = SafetyAutomationEngine;
//# sourceMappingURL=safety-automation.js.map