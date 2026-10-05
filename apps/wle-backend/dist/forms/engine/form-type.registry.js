"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFINITION_ID_TO_FORM_TYPE = exports.FORM_TYPE_TO_DEFINITION_ID = void 0;
exports.resolveFormType = resolveFormType;
exports.defaultFormData = defaultFormData;
const client_1 = require("@prisma/client");
exports.FORM_TYPE_TO_DEFINITION_ID = {
    JHA: 'jha',
    FLHA: 'flha',
    SIF: 'sif',
    HECA: 'heca',
    ENERGY_WHEEL: 'energy-wheel',
    INSPECTION: 'inspection',
};
exports.DEFINITION_ID_TO_FORM_TYPE = {
    jha: client_1.SafetyFormType.JHA,
    flha: client_1.SafetyFormType.FLHA,
    'daily-flha': client_1.SafetyFormType.FLHA,
    sif: client_1.SafetyFormType.SIF,
    heca: client_1.SafetyFormType.HECA,
    'heca-observation': client_1.SafetyFormType.HECA,
    'energy-wheel': client_1.SafetyFormType.ENERGY_WHEEL,
    inspection: client_1.SafetyFormType.INSPECTION,
    'general-inspection': client_1.SafetyFormType.INSPECTION,
    'pre-use-inspection': client_1.SafetyFormType.INSPECTION,
};
function resolveFormType(definitionId) {
    var _a;
    return (_a = exports.DEFINITION_ID_TO_FORM_TYPE[definitionId]) !== null && _a !== void 0 ? _a : null;
}
function defaultFormData(formType) {
    const today = new Date().toISOString().slice(0, 10);
    const base = { workDate: today };
    switch (formType) {
        case client_1.SafetyFormType.JHA:
            return Object.assign(Object.assign({}, base), { taskSteps: [], hazards: [] });
        case client_1.SafetyFormType.FLHA:
            return Object.assign(Object.assign({}, base), { hazards: [], controlsAdequate: 'yes' });
        case client_1.SafetyFormType.SIF:
            return Object.assign(Object.assign({}, base), { sifPotential: false, severity: 'medium', precursors: [] });
        case client_1.SafetyFormType.HECA:
            return Object.assign(Object.assign({}, base), { observationType: 'HECA' });
        case client_1.SafetyFormType.ENERGY_WHEEL:
            return Object.assign(Object.assign({}, base), { energyTypes: [], isolationRequired: false });
        case client_1.SafetyFormType.INSPECTION:
            return Object.assign(Object.assign({}, base), { complianceRating: 'compliant', hazards: [] });
        default:
            return base;
    }
}
//# sourceMappingURL=form-type.registry.js.map