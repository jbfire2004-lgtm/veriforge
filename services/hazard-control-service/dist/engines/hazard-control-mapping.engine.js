"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardControlMappingEngine = exports.HazardControlMappingEngine = void 0;
class HazardControlMappingEngine {
    validateMapping(input) {
        const missing = [];
        if (input.linkedControlCount === 0)
            missing.push('No controls mapped to hazard');
        if (input.sifPotential && input.trainingCount === 0) {
            missing.push('SIF-potential hazard requires training mapping');
        }
        if (input.ppeCount === 0 && input.sifPotential) {
            missing.push('Consider PPE mapping for high-risk hazard');
        }
        return {
            complete: missing.length === 0 && input.weakIssues.length === 0,
            missing,
            weakControls: input.weakIssues,
            requiredJhaControls: input.linkedControlCount
                ? [`JHA: document controls for ${input.hazardTitle}`]
                : [],
            requiredInspectionItems: input.linkedControlCount
                ? [`Inspection: verify controls for ${input.hazardTitle}`]
                : [`Inspection: identify controls for ${input.hazardTitle}`],
        };
    }
    hierarchyRank(controlType) {
        const ranks = {
            engineering: 1,
            administrative: 2,
            procedural: 3,
            equipment: 3,
            ppe: 5,
        };
        return ranks[controlType] ?? 4;
    }
}
exports.HazardControlMappingEngine = HazardControlMappingEngine;
exports.hazardControlMappingEngine = new HazardControlMappingEngine();
