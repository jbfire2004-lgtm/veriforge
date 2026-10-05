"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileGeneratorEngine = void 0;
class CompanyProfileGeneratorEngine {
    generate(input) {
        var _a, _b, _c, _d;
        let score = 0;
        if (((_a = input.incidentCount12m) !== null && _a !== void 0 ? _a : 0) > 5)
            score += 30;
        if (((_b = input.sifCount12m) !== null && _b !== void 0 ? _b : 0) > 0)
            score += 35;
        if (((_c = input.projectCount) !== null && _c !== void 0 ? _c : 0) > 5)
            score += 15;
        if (((_d = input.workerCount) !== null && _d !== void 0 ? _d : 0) > 100)
            score += 10;
        const corporateRiskLevel = score >= 60
            ? 'critical'
            : score >= 40
                ? 'high'
                : score >= 20
                    ? 'medium'
                    : 'low';
        return {
            corporateRiskLevel,
            ppeStandards: corporateRiskLevel === 'critical'
                ? ['HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'HI_VIS', 'STEEL_TOE']
                : ['HARD_HAT', 'SAFETY_GLASSES', 'HI_VIS'],
            enforcementRules: {
                blockAccessWithoutOrientation: true,
                blockAccessWithoutPolicyAck: true,
                requireSupervisorOverrideOnTrainingGap: true,
                requireSafetyOverrideOnSif: corporateRiskLevel === 'critical' || corporateRiskLevel === 'high',
                autoCapaOnRepeatDenial: true,
                syncHazardsToProjects: true,
                syncZoneTemplatesToProjects: true,
            },
            defaultTrainingMatrix: [
                {
                    roleType: 'worker',
                    category: 'general_safety',
                    trainingCode: 'ORIENTATION',
                    trainingName: 'Company orientation',
                    expiresInDays: 365,
                },
                {
                    roleType: 'supervisor',
                    category: 'general_safety',
                    trainingCode: 'SUPERVISOR_SAFETY',
                    trainingName: 'Supervisor safety leadership',
                    expiresInDays: 730,
                },
                {
                    roleType: 'equipment_operator',
                    category: 'equipment_operation',
                    trainingCode: 'EQUIP_AUTH',
                    trainingName: 'Equipment authorization',
                    expiresInDays: 365,
                },
                {
                    roleType: 'visitor',
                    category: 'general_safety',
                    trainingCode: 'SITE_ORIENTATION',
                    trainingName: 'Visitor site orientation',
                    expiresInDays: 30,
                },
            ],
        };
    }
}
exports.CompanyProfileGeneratorEngine = CompanyProfileGeneratorEngine;
//# sourceMappingURL=company-profile-generator.engine.js.map