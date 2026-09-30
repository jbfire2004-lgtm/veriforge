"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMappingEngine = void 0;
const fuzzy_1 = require("../utils/fuzzy");
class AutoMappingEngine {
    map(fields, input) {
        const mappings = [];
        const c = input.candidates;
        if (!c)
            return mappings;
        const workerName = fields.find((f) => f.key === "workerName")?.value;
        if (workerName && c.workers?.length) {
            const hit = (0, fuzzy_1.bestMatch)(workerName, c.workers);
            if (hit) {
                mappings.push({
                    entityType: "worker",
                    entityId: hit.item.id,
                    label: hit.item.name,
                    score: hit.score,
                });
            }
        }
        const providerName = fields.find((f) => f.key === "providerName")?.value;
        if (providerName && c.providers?.length) {
            const hit = (0, fuzzy_1.bestMatch)(providerName, c.providers);
            if (hit) {
                mappings.push({
                    entityType: "provider",
                    entityId: hit.item.id,
                    label: hit.item.name,
                    score: hit.score,
                });
            }
        }
        const courseName = fields.find((f) => f.key === "courseName")?.value;
        if (courseName && c.courses?.length) {
            const hit = (0, fuzzy_1.bestMatch)(courseName, c.courses);
            if (hit) {
                mappings.push({
                    entityType: "course",
                    entityId: hit.item.id,
                    label: hit.item.name,
                    score: hit.score,
                });
            }
        }
        const serial = fields.find((f) => f.key === "serialNumber")?.value;
        if (serial && c.equipment?.length) {
            let best = null;
            for (const eq of c.equipment) {
                const score = eq.serial ? (0, fuzzy_1.fuzzyScore)(serial, eq.serial) : (0, fuzzy_1.fuzzyScore)(serial, eq.name);
                if (score >= 0.6 && (!best || score > best.score)) {
                    best = { entityType: "equipment", entityId: eq.id, label: eq.name, score };
                }
            }
            if (best)
                mappings.push(best);
        }
        const projectName = fields.find((f) => f.key === "projectName")?.value;
        if (projectName && c.projects?.length) {
            const hit = (0, fuzzy_1.bestMatch)(projectName, c.projects);
            if (hit) {
                mappings.push({
                    entityType: "project",
                    entityId: hit.item.id,
                    label: hit.item.name,
                    score: hit.score,
                });
            }
        }
        const standard = fields.find((f) => f.key === "standard")?.value;
        if (standard) {
            mappings.push({
                entityType: "standard",
                label: standard,
                score: 0.9,
            });
        }
        return mappings.sort((a, b) => b.score - a.score);
    }
}
exports.AutoMappingEngine = AutoMappingEngine;
//# sourceMappingURL=auto-mapping.js.map