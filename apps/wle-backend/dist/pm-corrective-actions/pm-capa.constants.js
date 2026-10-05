"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOURCE_MODULE_TO_CAIL = exports.ESCALATION_LEVELS = exports.DUE_DAYS_DEFAULT = void 0;
exports.severityToScore = severityToScore;
exports.actionTypeDefault = actionTypeDefault;
exports.DUE_DAYS_DEFAULT = {
    low: 30,
    medium: 14,
    high: 7,
    critical: 1,
};
exports.ESCALATION_LEVELS = {
    1: 'Reminder',
    2: 'Supervisor escalation',
    3: 'Safety escalation',
    4: 'Project manager escalation',
    5: 'Company-level escalation',
};
exports.SOURCE_MODULE_TO_CAIL = {
    jha_flha: 'jha',
    inspection: 'inspection',
    incident: 'incident',
    sif_heca: 'sif',
    equipment: 'equipment',
    manual: 'general',
    training: 'training',
    safety_meetings: 'safety_meeting',
};
function severityToScore(sev) {
    var _a;
    const map = {
        low: 25,
        medium: 50,
        high: 75,
        critical: 100,
    };
    return (_a = map[sev]) !== null && _a !== void 0 ? _a : 50;
}
function actionTypeDefault(type) {
    var _a;
    const boosts = {
        immediate: 30,
        equipment_repair: 25,
        training_requirement: 15,
        interim_control: 20,
    };
    return { priorityBoost: (_a = boosts[type]) !== null && _a !== void 0 ? _a : 10 };
}
//# sourceMappingURL=pm-capa.constants.js.map