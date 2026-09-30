import type { BrainContextInput } from "../types";
import type { CommandContextInput } from "@vera/command-center";
import type { EnterpriseContextInput } from "@vera/enterprise-automation";
export declare function toCommandContext(ctx: BrainContextInput): CommandContextInput;
export declare function toEnterpriseContext(ctx: BrainContextInput): EnterpriseContextInput;
export declare function ingestAllPhases(ctx: BrainContextInput): {
    command: import("@vera/command-center").CommandCenterReport;
    enterprise: import("@vera/enterprise-automation").EnterpriseAutomationReport;
};
//# sourceMappingURL=phase-integration.d.ts.map