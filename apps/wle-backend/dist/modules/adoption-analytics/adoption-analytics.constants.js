"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADOPTION_CACHE_TTL_MS = exports.EVENT_TO_DAILY_FIELD = exports.ADOPTION_EVENT_TYPES = void 0;
exports.ADOPTION_EVENT_TYPES = {
    WORKER_CREATED: 'worker_created',
    EQUIPMENT_CREATED: 'equipment_created',
    TRAINING_UPLOADED: 'training_uploaded',
    VERIFICATION_RUN: 'verification_run',
    DIGITAL_SIGNOFF_SUBMITTED: 'digital_signoff_submitted',
    INCIDENT_CREATED: 'incident_created',
    PROJECT_CREATED: 'project_created',
    JHA_CREATED: 'jha_created',
    FLHA_CREATED: 'flha_created',
    SIF_LOGGED: 'sif_logged',
    USER_LOGIN: 'user_login',
};
exports.EVENT_TO_DAILY_FIELD = {
    [exports.ADOPTION_EVENT_TYPES.TRAINING_UPLOADED]: 'trainingEvents',
    [exports.ADOPTION_EVENT_TYPES.VERIFICATION_RUN]: 'verificationEvents',
    [exports.ADOPTION_EVENT_TYPES.DIGITAL_SIGNOFF_SUBMITTED]: 'signoffEvents',
    [exports.ADOPTION_EVENT_TYPES.INCIDENT_CREATED]: 'incidentEvents',
    [exports.ADOPTION_EVENT_TYPES.PROJECT_CREATED]: 'projectEvents',
    [exports.ADOPTION_EVENT_TYPES.JHA_CREATED]: 'jhaEvents',
    [exports.ADOPTION_EVENT_TYPES.FLHA_CREATED]: 'flhaEvents',
    [exports.ADOPTION_EVENT_TYPES.SIF_LOGGED]: 'sifEvents',
    [exports.ADOPTION_EVENT_TYPES.EQUIPMENT_CREATED]: 'equipmentEvents',
};
exports.ADOPTION_CACHE_TTL_MS = 60000;
//# sourceMappingURL=adoption-analytics.constants.js.map