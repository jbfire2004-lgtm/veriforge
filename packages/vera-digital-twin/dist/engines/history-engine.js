"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinHistoryEngine = void 0;
class TwinHistoryEngine {
    constructor() {
        this.snapshots = [];
    }
    record(twin) {
        this.snapshots.push({
            twinId: twin.id,
            twinType: twin.type,
            at: new Date().toISOString(),
            state: {
                compliance: twin.compliance,
                risk: twin.risk,
                readiness: twin.readiness,
                predictions: twin.predictions,
            },
        });
        if (this.snapshots.length > 5000) {
            this.snapshots = this.snapshots.slice(-4000);
        }
    }
    forTwin(twinType, twinId, limit = 50) {
        return this.snapshots
            .filter((s) => s.twinType === twinType && s.twinId === twinId)
            .slice(-limit);
    }
}
exports.TwinHistoryEngine = TwinHistoryEngine;
//# sourceMappingURL=history-engine.js.map