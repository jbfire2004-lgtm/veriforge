"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SifHecaScoringEngine = void 0;
class SifHecaScoringEngine {
    score(input) {
        const riskScore = input.severity * input.likelihood;
        let sifScore = riskScore;
        if (input.highEnergyCount >= 2)
            sifScore += 4;
        if (input.priorIncidentCount > 0)
            sifScore += 3;
        if (input.openCapaCount > 0)
            sifScore += 2;
        const sifPotential = !!input.sifPotential ||
            sifScore >= 16 ||
            (input.severity >= 4 && input.likelihood >= 4);
        let hecaCategoryKey = 'routine';
        if (sifScore >= 20)
            hecaCategoryKey = 'sif_precursor';
        else if (sifScore >= 12)
            hecaCategoryKey = 'high_potential';
        else if (riskScore >= 9)
            hecaCategoryKey = 'elevated';
        const supervisorReviewRequired = sifPotential || input.severity >= 4;
        const requireCapa = sifPotential || input.openCapaCount > 2;
        const explanation = [
            `Risk score ${riskScore} (severity ${input.severity} × likelihood ${input.likelihood})`,
        ];
        if (input.highEnergyCount >= 2) {
            explanation.push('Multiple high-energy sources increase SIF exposure');
        }
        if (sifPotential)
            explanation.push('Classified as SIF-potential hazard');
        return {
            riskScore,
            sifScore,
            sifPotential,
            hecaCategoryKey,
            supervisorReviewRequired,
            requireCapa,
            explanation,
        };
    }
}
exports.SifHecaScoringEngine = SifHecaScoringEngine;
//# sourceMappingURL=sif-heca-scoring.engine.js.map