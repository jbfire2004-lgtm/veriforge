"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNOFF_FIELDS = exports.HAZARD_FIELDS = exports.CONTEXT_FIELDS = void 0;
exports.buildForm = buildForm;
const CONTEXT_FIELDS = [
    { id: 'projectId', type: 'project', label: 'Project', required: false },
    { id: 'workerId', type: 'worker', label: 'Worker', required: true },
    { id: 'workLocation', type: 'text', label: 'Work location' },
    { id: 'workDate', type: 'date', label: 'Date', required: true },
];
exports.CONTEXT_FIELDS = CONTEXT_FIELDS;
const HAZARD_FIELDS = [
    {
        id: 'hazards',
        type: 'hazard',
        label: 'Hazards identified',
        required: true,
    },
    { id: 'controls', type: 'text', label: 'Control measures' },
    { id: 'energyTypes', type: 'energy', label: 'Energy sources' },
    { id: 'riskRating', type: 'risk', label: 'Risk rating' },
];
exports.HAZARD_FIELDS = HAZARD_FIELDS;
const SIGNOFF_FIELDS = [
    {
        id: 'workerSignature',
        type: 'signature',
        label: 'Worker signature',
        required: true,
    },
    {
        id: 'supervisorSignature',
        type: 'signature',
        label: 'Supervisor signature',
        conditional: { field: '__requiresSupervisor', equals: true },
    },
];
exports.SIGNOFF_FIELDS = SIGNOFF_FIELDS;
const PHOTO_FIELD = {
    id: 'photos',
    type: 'photo',
    label: 'Photos / attachments',
};
function buildForm(id, name, category, fields, workflow) {
    return {
        id,
        name,
        category,
        version: 1,
        fields: [...CONTEXT_FIELDS, ...fields, PHOTO_FIELD, ...SIGNOFF_FIELDS],
        workflow: Object.assign({ requiresSupervisor: true, autoGenerateCorrectiveActions: false, autoFlagSIF: false, autoFlagHECA: false }, workflow),
    };
}
//# sourceMappingURL=catalog.helpers.js.map