"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityPredictionEngine = void 0;
class AvailabilityPredictionEngine {
    predict(ctx) {
        const horizon = ctx.horizonDays ?? 7;
        const workers = ctx.workers ?? [];
        const slots = [];
        const base = new Date();
        for (const w of workers) {
            for (let d = 0; d < horizon; d++) {
                const date = new Date(base);
                date.setDate(date.getDate() + d);
                const iso = date.toISOString().slice(0, 10);
                let available = w.dispatchStatus !== "unavailable";
                if (w.dispatchStatus === "dispatched" && d < 2)
                    available = false;
                if (!w.isCompliant && d > 3)
                    available = false;
                slots.push({ workerId: w.id, date: iso, available });
            }
        }
        return slots;
    }
}
exports.AvailabilityPredictionEngine = AvailabilityPredictionEngine;
//# sourceMappingURL=availability-prediction.js.map