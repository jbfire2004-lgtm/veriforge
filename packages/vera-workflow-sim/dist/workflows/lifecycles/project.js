"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectLifecycle = void 0;
const builder_1 = require("../builder");
exports.projectLifecycle = (0, builder_1.buildWorkflow)({
    id: "project.lifecycle",
    title: "Project Lifecycle",
    category: "project",
    initialState: "draft",
    terminalStates: ["archived"],
    modules: ["Projects", "Workers", "Equipment", "Compliance", "Dashboard"],
    steps: [
        { id: "create", label: "Project creation", permissions: ["COMPANY_ADMIN"] },
        { id: "assignWorkers", label: "Worker assignment", permissions: ["SUPERVISOR"] },
        { id: "assignEquipment", label: "Equipment assignment", permissions: ["SUPERVISOR"] },
        { id: "readiness", label: "Readiness check", complianceChecks: ["project.readiness"] },
        { id: "dailyOps", label: "Daily operations", permissions: ["SUPERVISOR"] },
        { id: "monitor", label: "Compliance monitoring" },
        { id: "close", label: "Project closure", permissions: ["COMPANY_ADMIN"] },
        { id: "archive", label: "History archival" },
    ],
    transitions: [
        { from: "draft", to: "created", event: "project.create" },
        { from: "created", to: "staffing", event: "project.assignWorkers" },
        { from: "staffing", to: "equipped", event: "project.assignEquipment" },
        { from: "equipped", to: "readinessCheck", event: "project.readinessStart" },
        { from: "readinessCheck", to: "ready", event: "compliance.pass", guards: ["project.readiness"] },
        { from: "readinessCheck", to: "blocked", event: "compliance.fail" },
        { from: "blocked", to: "readinessCheck", event: "compliance.remediated" },
        { from: "ready", to: "active", event: "project.startOps" },
        { from: "active", to: "monitoring", event: "compliance.monitor" },
        { from: "active", to: "closing", event: "project.close" },
        { from: "closing", to: "archived", event: "project.archive" },
    ],
});
//# sourceMappingURL=project.js.map