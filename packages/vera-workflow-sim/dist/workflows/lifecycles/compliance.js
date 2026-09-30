"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complianceLifecycle = void 0;
const builder_1 = require("../builder");
exports.complianceLifecycle = (0, builder_1.buildWorkflow)({
    id: "compliance.lifecycle",
    title: "Compliance Lifecycle",
    category: "compliance",
    initialState: "evaluating",
    terminalStates: ["cleared", "blocked"],
    modules: ["Compliance", "Training", "Inspections", "Competency"],
    steps: [
        { id: "workerCompliance", label: "Worker compliance" },
        { id: "equipmentCompliance", label: "Equipment compliance" },
        { id: "projectReadiness", label: "Project readiness" },
        { id: "trainingExpiry", label: "Training expiry" },
        { id: "inspectionFail", label: "Inspection failure" },
        { id: "lockout", label: "Lockout" },
        { id: "competencyFail", label: "Competency failure" },
        { id: "providerNonCompliance", label: "Provider non-compliance" },
    ],
    transitions: [
        { from: "evaluating", to: "workerOk", event: "compliance.workerPass" },
        { from: "workerOk", to: "equipmentOk", event: "compliance.equipmentPass" },
        { from: "equipmentOk", to: "readinessOk", event: "compliance.readinessPass", guards: ["project.readiness"] },
        { from: "readinessOk", to: "cleared", event: "compliance.clear" },
        { from: "evaluating", to: "trainingExpired", event: "training.expire" },
        { from: "equipmentOk", to: "inspectionFailed", event: "inspection.fail" },
        { from: "inspectionFailed", to: "lockedOut", event: "equipment.lockout" },
        { from: "workerOk", to: "competencyFailed", event: "competency.fail" },
        { from: "evaluating", to: "providerFailed", event: "provider.nonCompliant" },
        { from: "trainingExpired", to: "blocked", event: "compliance.block" },
        { from: "lockedOut", to: "blocked", event: "compliance.block" },
        { from: "competencyFailed", to: "blocked", event: "compliance.block" },
        { from: "providerFailed", to: "blocked", event: "compliance.block" },
        { from: "blocked", to: "evaluating", event: "compliance.remediated" },
    ],
});
//# sourceMappingURL=compliance.js.map