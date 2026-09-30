"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncLifecycle = void 0;
const builder_1 = require("../builder");
exports.offlineSyncLifecycle = (0, builder_1.buildWorkflow)({
    id: "offlineSync.lifecycle",
    title: "Offline → Online Sync Lifecycle",
    category: "offlineSync",
    initialState: "online",
    terminalStates: ["synced"],
    modules: ["Field", "API", "Sync"],
    steps: [
        { id: "qrOffline", label: "Offline QR scan", offlineCapable: true },
        { id: "workerLink", label: "Offline worker linking", offlineCapable: true },
        { id: "equipmentLink", label: "Offline equipment linking", offlineCapable: true },
        { id: "projectAssign", label: "Offline project assignment", offlineCapable: true },
        { id: "inspection", label: "Offline inspection", offlineCapable: true },
        { id: "trainingUpload", label: "Offline training upload", offlineCapable: true },
        { id: "queueProcess", label: "Sync queue processing" },
        { id: "conflictResolve", label: "Conflict resolution" },
        { id: "deltaUpdate", label: "Delta updates" },
        { id: "versioning", label: "Versioning" },
    ],
    transitions: [
        { from: "online", to: "offline", event: "connectivity.lost" },
        { from: "offline", to: "queued", event: "offline.action", guards: ["offline.mode"] },
        { from: "queued", to: "syncing", event: "connectivity.restored" },
        { from: "syncing", to: "conflict", event: "sync.conflict" },
        { from: "conflict", to: "resolved", event: "sync.resolve" },
        { from: "syncing", to: "synced", event: "sync.batchComplete" },
        { from: "resolved", to: "synced", event: "sync.deltaApply" },
        { from: "synced", to: "online", event: "sync.ack" },
    ],
});
//# sourceMappingURL=offline-sync.js.map