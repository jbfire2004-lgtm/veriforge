"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSafetyScoringEngine = exports.ProjectSafetyScoringEngine = exports.versioningEngine = exports.VersioningEngine = exports.hazardScoringEngine = exports.HazardScoringEngine = void 0;
const crypto_1 = require("crypto");
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
        return { sifPotential, hecaCategory, riskScore };
    }
}
exports.HazardScoringEngine = HazardScoringEngine;
exports.hazardScoringEngine = new HazardScoringEngine();
class VersioningEngine {
    nextVersion(current) {
        return current + 1;
    }
    newId() {
        return (0, crypto_1.randomUUID)();
    }
}
exports.VersioningEngine = VersioningEngine;
exports.versioningEngine = new VersioningEngine();
class ProjectSafetyScoringEngine {
    compute(projectId, companyId, input, version) {
        const gaps = [];
        let sifExposure = false;
        const profileCompleteness = input.profile ? (input.profile.status === 'published' ? 100 : 60) : 0;
        if (!input.profile)
            gaps.push('Project safety profile not configured');
        for (const h of input.hazards) {
            if (h.sifPotential)
                sifExposure = true;
        }
        const hazardCoverage = input.hazards.length === 0
            ? 0
            : Math.min(100, 40 + input.hazards.length * 10);
        if (input.hazards.length === 0)
            gaps.push('No project hazards defined');
        const avgStrength = input.controls.length === 0
            ? 0
            : input.controls.reduce((s, c) => s + c.controlStrength, 0) / input.controls.length;
        const controlAdequacy = Math.min(100, Math.round(avgStrength * 20));
        if (input.controls.length === 0)
            gaps.push('No project controls defined');
        const zonesWithRules = input.zones.filter((z) => z.rules.length > 0);
        const zoneCompliance = input.zones.length === 0
            ? 0
            : Math.round((zonesWithRules.length / input.zones.length) * 100);
        if (input.zones.length === 0)
            gaps.push('No project zones configured');
        const trainingCoverage = input.training.length > 0 ? Math.min(100, input.training.length * 25) : 0;
        if (input.training.length === 0)
            gaps.push('No project training requirements');
        const emergencyReadiness = input.emergency.length > 0 ? Math.min(100, input.emergency.length * 30) : 0;
        if (input.emergency.length === 0)
            gaps.push('No project emergency requirements');
        const components = {
            profileCompleteness,
            hazardCoverage,
            controlAdequacy,
            zoneCompliance,
            trainingCoverage,
            emergencyReadiness,
        };
        const score = Math.round(profileCompleteness * 0.2 +
            hazardCoverage * 0.2 +
            controlAdequacy * 0.2 +
            zoneCompliance * 0.15 +
            trainingCoverage * 0.15 +
            emergencyReadiness * 0.1);
        if (sifExposure && controlAdequacy < 60) {
            gaps.push('SIF-potential hazards need stronger controls');
        }
        return {
            projectId,
            companyId,
            score,
            riskLevel: input.profile?.riskLevel ?? 'unknown',
            components,
            sifExposure,
            gaps,
            version,
        };
    }
}
exports.ProjectSafetyScoringEngine = ProjectSafetyScoringEngine;
exports.projectSafetyScoringEngine = new ProjectSafetyScoringEngine();
