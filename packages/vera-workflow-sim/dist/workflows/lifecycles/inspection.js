"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionLifecycle = void 0;
const builder_1 = require("../builder");
exports.inspectionLifecycle = (0, builder_1.buildWorkflow)({
    id: "inspection.lifecycle",
    title: "Inspection Lifecycle",
    category: "inspection",
    initialState: "scheduled",
    terminalStates: ["archived"],
    modules: ["Inspections", "Equipment", "Field"],
    steps: [
        { id: "preUse", label: "Pre-use inspection", permissions: ["SUPERVISOR"], offlineCapable: true },
        { id: "scheduled", label: "Scheduled inspection", permissions: ["SUPERVISOR"], offlineCapable: true },
        { id: "failLockout", label: "Failure → lockout" },
        { id: "offline", label: "Offline inspection", offlineCapable: true },
        { id: "syncConflict", label: "Sync + conflict resolution" },
    ],
    transitions: [
        { from: "scheduled", to: "preUseActive", event: "inspection.preUseStart" },
        { from: "preUseActive", to: "passed", event: "inspection.pass" },
        { from: "preUseActive", to: "failed", event: "inspection.fail" },
        { from: "scheduled", to: "inProgress", event: "inspection.scheduledStart" },
        { from: "inProgress", to: "passed", event: "inspection.pass" },
        { from: "inProgress", to: "failed", event: "inspection.fail" },
        { from: "failed", to: "lockout", event: "equipment.lockout" },
        { from: "preUseActive", to: "offlinePending", event: "inspection.offlineSubmit", guards: ["offline.mode"] },
        { from: "scheduled", to: "offlinePending", event: "inspection.offlineSubmit", guards: ["offline.mode"] },
        { from: "offlinePending", to: "syncConflict", event: "sync.conflict" },
        { from: "syncConflict", to: "passed", event: "sync.resolve.merge" },
        { from: "syncConflict", to: "failed", event: "sync.resolve.server" },
        { from: "passed", to: "archived", event: "inspection.archive" },
    ],
});
//# sourceMappingURL=inspection.js.map