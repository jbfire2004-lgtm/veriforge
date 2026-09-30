"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_SCORE_TYPES = exports.SCORE_TYPE_TO_ENTITY = void 0;
exports.SCORE_TYPE_TO_ENTITY = {
    worker_safety: 'worker',
    equipment_safety: 'equipment',
    project_safety: 'project',
    company_safety: 'company',
    hazard_severity: 'hazard',
    control_strength: 'control',
    jha_quality: 'jha',
    inspection_quality: 'inspection',
    corrective_action_priority: 'corrective_action',
    emergency_readiness: 'emergency',
    access_compliance: 'access',
};
exports.VALID_SCORE_TYPES = Object.keys(exports.SCORE_TYPE_TO_ENTITY);
