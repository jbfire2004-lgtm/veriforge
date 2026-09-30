import type { BrainContextInput, EnterpriseGoals } from "../types";
export declare class EnterpriseGoalEngine {
    resolve(ctx: BrainContextInput): EnterpriseGoals;
    balance(goals: EnterpriseGoals): {
        primary: string;
        tradeoffs: string[];
    };
}
//# sourceMappingURL=enterprise-goals.d.ts.map