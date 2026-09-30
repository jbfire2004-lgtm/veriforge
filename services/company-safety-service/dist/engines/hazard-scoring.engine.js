"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardScoringEngine = exports.HazardScoringEngine = void 0;
class HazardScoringEngine {
    score(severity, likelihood) {
        const riskScore = severity * likelihood;
        const sifPotential = riskScore >= 16 || (severity >= 4 && likelihood >= 4);
        let hecaCategory = 'routine';
        if (riskScore >= 20)
            hecaCategory = 'sif_precursor';
        else if (riskScore >= 12)
            hecaCategory = 'high_potential';
        else if (riskScore >= 9)
            hecaCategory = 'elevated';
        return { sifPotential, hecaCategory };
    }
}
exports.HazardScoringEngine = HazardScoringEngine;
exports.hazardScoringEngine = new HazardScoringEngine();
