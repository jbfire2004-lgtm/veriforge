import type { IntelligenceModule, Recommendation } from "../types";
export declare class RecommendationEngine {
    private items;
    suggest(partial: Omit<Recommendation, "id" | "priority"> & {
        priority?: number;
    }): Recommendation;
    suggestMany(items: Omit<Recommendation, "id">[]): Recommendation[];
    prioritize(module?: IntelligenceModule): Recommendation[];
    reset(): void;
    getAll(): Recommendation[];
}
//# sourceMappingURL=recommendation-engine.d.ts.map