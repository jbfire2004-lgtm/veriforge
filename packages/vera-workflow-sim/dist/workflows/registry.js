"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_BY_ID = exports.ALL_WORKFLOWS = void 0;
exports.getWorkflow = getWorkflow;
exports.workflowsByCategory = workflowsByCategory;
const company_1 = require("./lifecycles/company");
const competency_1 = require("./lifecycles/competency");
const compliance_1 = require("./lifecycles/compliance");
const dashboard_1 = require("./lifecycles/dashboard");
const equipment_1 = require("./lifecycles/equipment");
const inspection_1 = require("./lifecycles/inspection");
const offline_sync_1 = require("./lifecycles/offline-sync");
const project_1 = require("./lifecycles/project");
const training_1 = require("./lifecycles/training");
const training_provider_1 = require("./lifecycles/training-provider");
const union_hall_1 = require("./lifecycles/union-hall");
const worker_1 = require("./lifecycles/worker");
exports.ALL_WORKFLOWS = [
    worker_1.workerLifecycle,
    equipment_1.equipmentLifecycle,
    training_1.trainingLifecycle,
    training_provider_1.trainingProviderLifecycle,
    union_hall_1.unionHallLifecycle,
    company_1.companyLifecycle,
    project_1.projectLifecycle,
    compliance_1.complianceLifecycle,
    inspection_1.inspectionLifecycle,
    competency_1.competencyLifecycle,
    offline_sync_1.offlineSyncLifecycle,
    dashboard_1.dashboardLifecycle,
];
exports.WORKFLOW_BY_ID = Object.fromEntries(exports.ALL_WORKFLOWS.map((w) => [w.id, w]));
function getWorkflow(id) {
    return exports.WORKFLOW_BY_ID[id];
}
function workflowsByCategory(category) {
    return exports.ALL_WORKFLOWS.filter((w) => w.category === category);
}
//# sourceMappingURL=registry.js.map