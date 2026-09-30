"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngine = void 0;
let recCounter = 0;
class RecommendationEngine {
    constructor() {
        this.items = [];
    }
    suggest(partial) {
        const rec = {
            id: `rec_${++recCounter}`,
            priority: partial.priority ?? 50,
            ...partial,
        };
        this.items.push(rec);
        return rec;
    }
    suggestMany(items) {
        return items.map((item) => this.suggest(item));
    }
    prioritize(module) {
        const list = module ? this.items.filter((r) => r.module === module) : [...this.items];
        return list.sort((a, b) => b.priority - a.priority);
    }
    reset() {
        this.items = [];
        recCounter = 0;
    }
    getAll() {
        return this.prioritize();
    }
}
exports.RecommendationEngine = RecommendationEngine;
//# sourceMappingURL=recommendation-engine.js.map