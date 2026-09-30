"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competencyLifecycle = void 0;
const builder_1 = require("../builder");
exports.competencyLifecycle = (0, builder_1.buildWorkflow)({
    id: "competency.lifecycle",
    title: "Competency Lifecycle",
    category: "competency",
    initialState: "pending",
    terminalStates: ["archived"],
    modules: ["Competency", "Workers", "Equipment", "Field"],
    steps: [
        { id: "evaluate", label: "Competency evaluation", permissions: ["SUPERVISOR"], offlineCapable: true },
        { id: "expiry", label: "Competency expiry" },
        { id: "failure", label: "Competency failure" },
        { id: "override", label: "Competency override", permissions: ["COMPANY_ADMIN"] },
        { id: "offlineEval", label: "Offline competency evaluation", offlineCapable: true },
    ],
    transitions: [
        { from: "pending", to: "evaluating", event: "competency.start" },
        { from: "evaluating", to: "passed", event: "competency.pass" },
        { from: "evaluating", to: "failed", event: "competency.fail" },
        { from: "passed", to: "expiring", event: "competency.expiryWarning" },
        { from: "expiring", to: "expired", event: "competency.expire" },
        { from: "failed", to: "remediation", event: "competency.remediate" },
        { from: "remediation", to: "passed", event: "competency.pass" },
        { from: "failed", to: "overridden", event: "competency.override", permissions: ["COMPANY_ADMIN"] },
        { from: "pending", to: "offlinePending", event: "competency.offlineEval", guards: ["offline.mode"] },
        { from: "offlinePending", to: "passed", event: "sync.complete" },
        { from: "expired", to: "archived", event: "competency.archive" },
    ],
});
//# sourceMappingURL=competency.js.map