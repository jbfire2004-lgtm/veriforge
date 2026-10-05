"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileGeneratorEngine = void 0;
class ProfileGeneratorEngine {
    generate(input) {
        var _a, _b, _c, _d, _e;
        let score = 0;
        if (input.incidentCount12m && input.incidentCount12m > 3)
            score += 25;
        if (input.sifEventCount12m && input.sifEventCount12m > 0)
            score += 40;
        if (((_a = input.equipmentCount) !== null && _a !== void 0 ? _a : 0) > 10)
            score += 15;
        if (((_b = input.subcontractorCount) !== null && _b !== void 0 ? _b : 0) > 2)
            score += 10;
        const env = (_c = input.environmental) !== null && _c !== void 0 ? _c : {};
        if (env.extremeWeather || env.confinedSpace)
            score += 20;
        const riskLevel = score >= 60
            ? 'critical'
            : score >= 40
                ? 'high'
                : score >= 20
                    ? 'medium'
                    : 'low';
        const jhaTypes = riskLevel === 'critical' || riskLevel === 'high'
            ? ['FLHA', 'JHA', 'TASK_JHA']
            : ['FLHA', 'JHA'];
        const inspections = [
            { type: 'site_general', cadenceDays: 7 },
        ];
        if (riskLevel === 'high' || riskLevel === 'critical') {
            inspections.push({ type: 'equipment', cadenceDays: 14 });
            inspections.push({ type: 'high_risk_task', cadenceDays: 1 });
        }
        const training = riskLevel === 'critical'
            ? ['ORIENTATION', 'FALL_PROTECTION', 'CONFINED_SPACE', 'HAZCOM']
            : riskLevel === 'high'
                ? ['ORIENTATION', 'FALL_PROTECTION', 'HAZCOM']
                : ['ORIENTATION'];
        return {
            riskLevel,
            requiredJhaTypes: jhaTypes,
            requiredInspections: inspections,
            requiredTraining: training,
            requiredEquipmentCerts: ((_d = input.equipmentCount) !== null && _d !== void 0 ? _d : 0) > 0
                ? ['ANNUAL_INSPECTION', 'OPERATOR_AUTH']
                : [],
            requiredPpe: riskLevel === 'critical'
                ? ['HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'HI_VIS']
                : ['HARD_HAT', 'SAFETY_GLASSES'],
            requiredEmergencyPlans: true,
            requiredSdsAcks: (_e = env.chemicalStorage) !== null && _e !== void 0 ? _e : riskLevel !== 'low',
            requiredToolboxTalks: {
                frequencyDays: riskLevel === 'critical' ? 7 : 14,
            },
            enforcementRules: {
                blockAccessWithoutFlha: true,
                blockAccessWithoutOrientation: true,
                requireSupervisorOverrideOnDenial: riskLevel === 'high' || riskLevel === 'critical',
                sifGateEnabled: input.sifEventCount12m
                    ? input.sifEventCount12m > 0
                    : true,
            },
            zoneRules: [
                {
                    zoneCode: 'SITE',
                    requiresFlhaHours: riskLevel === 'critical' ? 8 : 24,
                    requiresJha: riskLevel !== 'low',
                    highRisk: riskLevel === 'high' || riskLevel === 'critical',
                },
            ],
            equipmentRules: {
                requireInspectionCurrent: true,
                requireLotoClear: true,
                blockOutOfService: true,
            },
            trainingRules: {
                enforceExpiry: true,
                graceDays: 0,
            },
            emergencyRules: {
                requirePlanAck: true,
                autoMusterOnDeclare: true,
                lockSiteOnEmergency: riskLevel === 'critical' || riskLevel === 'high',
            },
        };
    }
}
exports.ProfileGeneratorEngine = ProfileGeneratorEngine;
//# sourceMappingURL=profile-generator.engine.js.map