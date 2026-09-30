import type { AutomationConflict, EnterpriseAction } from "../types";
export declare class AutomationConflictResolver {
    resolve(actions: EnterpriseAction[]): {
        resolved: EnterpriseAction[];
        conflicts: AutomationConflict[];
    };
}
//# sourceMappingURL=automation-conflicts.d.ts.map