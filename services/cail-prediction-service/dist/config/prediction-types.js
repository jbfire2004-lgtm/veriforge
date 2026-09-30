"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTITY_TYPES = exports.PREDICTION_TO_MODULE = exports.PREDICTION_TO_ENTITY = exports.VALID_PREDICTION_TYPES = void 0;
exports.VALID_PREDICTION_TYPES = [
    'incident_likelihood',
    'equipment_failure',
    'hazard_emergence',
    'sif_heca_potential',
    'training_lapse',
    'capa_overdue',
    'access_denial',
    'emergency_likelihood',
];
exports.PREDICTION_TO_ENTITY = {
    incident_likelihood: 'worker',
    equipment_failure: 'equipment',
    hazard_emergence: 'hazard',
    sif_heca_potential: 'hazard',
    training_lapse: 'worker',
    capa_overdue: 'corrective_action',
    access_denial: 'access',
    emergency_likelihood: 'project',
};
exports.PREDICTION_TO_MODULE = {
    incident_likelihood: 'incidents',
    equipment_failure: 'equipment',
    hazard_emergence: 'hazard_control',
    sif_heca_potential: 'sif_heca',
    training_lapse: 'training',
    capa_overdue: 'corrective_action',
    access_denial: 'site_access',
    emergency_likelihood: 'emergency',
};
exports.ENTITY_TYPES = [
    'worker',
    'equipment',
    'project',
    'company',
    'hazard',
    'corrective_action',
    'access',
    'emergency',
    'training',
];
