"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SifPreventionEngine = void 0;
const scoring_1 = require("../utils/scoring");
const SIF_PRECURSORS = [
    { code: "HEIGHT_WORK", re: /height|fall|scaffold|ladder|roof/i },
    { code: "ENERGIZED_WORK", re: /energized|live|electrical|lockout/i },
    { code: "LIFTING", re: /lift|rigging|crane|hoist|load/i },
    { code: "CONFINED_SPACE", re: /confined|tank|vessel|entry/i },
    { code: "MOBILE_EQUIPMENT", re: /mobile|vehicle|forklift|excavat/i },
];
class SifPreventionEngine {
    analyze(ctx) {
        const text = this.collectText(ctx);
        const hazards = (0, scoring_1.extractHazards)(text);
        const precursors = SIF_PRECURSORS.filter((p) => p.re.test(text)).map((p) => ({
            code: p.code,
            message: `SIF precursor: ${p.code.replace(/_/g, " ").toLowerCase()}`,
            confidence: 0.75,
        }));
        if (ctx.visionHazards?.length) {
            for (const h of ctx.visionHazards) {
                precursors.push({
                    code: `VISION_${h.toUpperCase()}`,
                    message: `Vision-detected hazard: ${h}`,
                    confidence: 0.7,
                });
            }
        }
        const riskScore = (0, scoring_1.safetyScore)([
            { weight: 35, value: Math.min(100, precursors.length * 22) },
            { weight: 25, value: (ctx.inspectionFailures ?? 0) * 25 },
            { weight: 20, value: (ctx.trainingGaps ?? 0) * 15 },
            { weight: 20, value: ctx.twinRiskScores?.project ?? 30 },
        ]);
        const interventions = [];
        if (riskScore.level === "critical" || riskScore.level === "high") {
            interventions.push("notify_supervisor", "escalate_management");
        }
        if (precursors.some((p) => p.code === "ENERGIZED_WORK")) {
            interventions.push("lockout_equipment");
        }
        if ((ctx.trainingGaps ?? 0) > 0)
            interventions.push("require_training");
        return {
            riskScore,
            precursors,
            patterns: this.detectPatterns(ctx),
            trends: [
                {
                    direction: precursors.length > 2 ? "up" : "stable",
                    label: "SIF precursor frequency",
                },
            ],
            clusters: hazards.length ? [`Cluster: ${hazards.slice(0, 3).join(", ")}`] : [],
            recommendations: this.recommendations(precursors, ctx),
            interventions,
        };
    }
    collectText(ctx) {
        const parts = (ctx.forms ?? []).map((f) => `${f.hazardSummary ?? ""} ${f.controlMeasures ?? ""} ${(f.taskSteps ?? []).join(" ")}`);
        return parts.join(" ");
    }
    detectPatterns(ctx) {
        const patterns = [];
        const sifForms = (ctx.forms ?? []).filter((f) => f.kind === "SIF");
        if (sifForms.length >= 2)
            patterns.push("Repeated SIF-focused assessments");
        if ((ctx.inspectionFailures ?? 0) >= 2)
            patterns.push("Inspection failure chain");
        return patterns;
    }
    recommendations(precursors, ctx) {
        const recs = [];
        if (precursors.length)
            recs.push("Conduct SIF-focused pre-job briefing");
        if (precursors.some((p) => p.code.includes("HEIGHT"))) {
            recs.push("Verify fall protection and rescue plan");
        }
        if ((ctx.competencyGaps ?? 0) > 0)
            recs.push("Verify competency for critical tasks");
        if (!recs.length)
            recs.push("Maintain SIF controls — no immediate precursors");
        return recs;
    }
}
exports.SifPreventionEngine = SifPreventionEngine;
//# sourceMappingURL=sif-prevention.js.map