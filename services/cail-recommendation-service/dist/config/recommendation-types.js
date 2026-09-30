"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_TYPES = exports.RECOMMENDATION_TO_ENTITY = exports.VALID_RECOMMENDATION_TYPES = void 0;
exports.VALID_RECOMMENDATION_TYPES = [
    'control',
    'training',
    'corrective_action',
    'equipment_maintenance',
    'jha_improvement',
    'inspection_focus',
    'pm_schedule_adjustment',
];
exports.RECOMMENDATION_TO_ENTITY = {
    control: 'hazard',
    training: 'worker',
    corrective_action: 'corrective_action',
    equipment_maintenance: 'equipment',
    jha_improvement: 'jha',
    inspection_focus: 'inspection',
    pm_schedule_adjustment: 'schedule',
};
exports.ENTITY_TYPES = [
    'worker',
    'equipment',
    'project',
    'company',
    'hazard',
    'control',
    'jha',
    'inspection',
    'corrective_action',
    'schedule',
];
