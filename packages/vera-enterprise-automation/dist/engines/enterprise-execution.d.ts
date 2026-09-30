import type { EnterpriseAction, EnterpriseContextInput, EnterpriseExecutionResult } from "../types";
export declare class EnterpriseExecutionEngine {
    execute(ctx: EnterpriseContextInput, actions: EnterpriseAction[]): EnterpriseExecutionResult;
    override(action: EnterpriseAction, reason: string): EnterpriseAction;
    rollback(action: EnterpriseAction, reason: string): EnterpriseAction;
}
//# sourceMappingURL=enterprise-execution.d.ts.map