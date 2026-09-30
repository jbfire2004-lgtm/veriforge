"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinAutomationEngine = void 0;
const actions_1 = require("../utils/actions");
class TwinAutomationEngine {
    run(ctx) {
        const actions = [];
        const updated = [];
        const predictions = [];
        const types = ["worker", "equipment", "project", "company", "provider", "unionHall"];
        for (const type of types) {
            if (type === "unionHall" && !ctx.unionHallId)
                continue;
            if (type === "provider")
                continue;
            updated.push({
                type,
                id: type === "company" ? ctx.companyId ?? "0" : ctx.companyId ?? "0",
                fields: ["compliance", "risk", "readiness", "predictions"],
            });
            actions.push((0, actions_1.enterpriseAction)({
                module: "twin",
                phase: "VDTE",
                type: `twin.update_${type}`,
                title: `Update ${type} twin`,
                reason: "Enterprise automation sync",
                entityType: type,
                entityId: type === "unionHall" ? ctx.unionHallId : ctx.companyId ?? "0",
                priority: (0, actions_1.priorityScore)({ readiness: 60 }),
                overrideable: false,
                rollbackable: false,
            }));
        }
        if ((ctx.nonCompliantWorkers ?? 0) > 0) {
            predictions.push({
                entityId: ctx.companyId ?? "0",
                label: "Compliance decline",
                probability: 0.65,
            });
        }
        return {
            actions,
            insights: [`${updated.length} twin types updated`],
            overlay: { updated, predictions },
        };
    }
}
exports.TwinAutomationEngine = TwinAutomationEngine;
//# sourceMappingURL=twin-automation.js.map