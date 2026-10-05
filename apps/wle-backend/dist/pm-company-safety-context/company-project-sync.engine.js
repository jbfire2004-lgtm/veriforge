"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProjectSyncEngine = void 0;
const CATEGORY_MAP = {
    energy: 'energy',
    environmental: 'environmental',
    equipment: 'equipment',
    chemical: 'chemical',
    behavioral: 'behavioral',
    organizational: 'site_specific',
    site_specific: 'site_specific',
};
class CompanyProjectSyncEngine {
    mapHazardCategory(companyCategory) {
        var _a;
        return (_a = CATEGORY_MAP[companyCategory]) !== null && _a !== void 0 ? _a : 'site_specific';
    }
    zoneTemplateToAccessRule(template) {
        return {
            zoneCode: template.templateCode,
            zoneType: template.zoneType,
            requiresFlhaHours: template.requiresFlhaHours,
            requiresJha: template.requiresJha,
            requiresSdsAck: template.requiresSdsAck,
            highRisk: template.highRisk,
            requiredPpe: template.requiredPpe,
            requiresTrainingCodes: template.requiredTraining,
        };
    }
}
exports.CompanyProjectSyncEngine = CompanyProjectSyncEngine;
//# sourceMappingURL=company-project-sync.engine.js.map