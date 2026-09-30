"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardLifecycle = void 0;
const builder_1 = require("../builder");
exports.dashboardLifecycle = (0, builder_1.buildWorkflow)({
    id: "dashboard.lifecycle",
    title: "Dashboard Data Lifecycle",
    category: "dashboard",
    initialState: "idle",
    terminalStates: ["stale"],
    modules: ["Dashboard", "Reporting", "Field"],
    steps: [
        { id: "pipelines", label: "Widget data pipelines" },
        { id: "realtime", label: "Real-time updates" },
        { id: "offlineMode", label: "Offline dashboard mode", offlineCapable: true },
        { id: "syncRefresh", label: "Sync-triggered dashboard refresh" },
    ],
    transitions: [
        { from: "idle", to: "loading", event: "dashboard.fetch" },
        { from: "loading", to: "live", event: "dashboard.pipelinesReady" },
        { from: "live", to: "updating", event: "dashboard.realtimeTick" },
        { from: "updating", to: "live", event: "dashboard.renderComplete" },
        { from: "live", to: "offlineCache", event: "connectivity.lost", guards: ["offline.mode"] },
        { from: "offlineCache", to: "refreshing", event: "sync.complete" },
        { from: "refreshing", to: "live", event: "dashboard.syncRefresh" },
        { from: "live", to: "stale", event: "dashboard.ttlExceeded" },
    ],
});
//# sourceMappingURL=dashboard.js.map