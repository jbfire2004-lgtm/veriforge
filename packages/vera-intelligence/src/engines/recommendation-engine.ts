import type { IntelligenceModule, Recommendation } from "../types";

let recCounter = 0;

export class RecommendationEngine {
  private items: Recommendation[] = [];

  suggest(partial: Omit<Recommendation, "id" | "priority"> & { priority?: number }): Recommendation {
    const rec: Recommendation = {
      id: `rec_${++recCounter}`,
      priority: partial.priority ?? 50,
      ...partial,
    };
    this.items.push(rec);
    return rec;
  }

  suggestMany(items: Omit<Recommendation, "id">[]): Recommendation[] {
    return items.map((item) => this.suggest(item));
  }

  prioritize(module?: IntelligenceModule): Recommendation[] {
    const list = module ? this.items.filter((r) => r.module === module) : [...this.items];
    return list.sort((a, b) => b.priority - a.priority);
  }

  reset(): void {
    this.items = [];
    recCounter = 0;
  }

  getAll(): Recommendation[] {
    return this.prioritize();
  }
}
