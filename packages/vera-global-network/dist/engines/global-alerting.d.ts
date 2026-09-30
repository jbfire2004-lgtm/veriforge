import type { GlobalAlert, NetworkContextInput } from "../types";
import type { GlobalHazardIntelligence } from "../types";
import type { GlobalSafetyIntelligence } from "../types";
export declare class GlobalAlertingEngine {
    generate(ctx: NetworkContextInput, hazards: GlobalHazardIntelligence, safety: GlobalSafetyIntelligence): GlobalAlert[];
}
//# sourceMappingURL=global-alerting.d.ts.map