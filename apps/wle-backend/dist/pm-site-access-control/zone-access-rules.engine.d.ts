export type ZoneRuleContext = {
    timeWindowStart?: string | null;
    timeWindowEnd?: string | null;
    requiresJha: boolean;
    requiresSdsAck: boolean;
    requiresPermitIds: string[];
    requiredPpe: string[];
};
export declare class ZoneAccessRulesEngine {
    isWithinTimeWindow(start?: string | null, end?: string | null, now?: Date): boolean;
    evaluateTimeWindow(rule: ZoneRuleContext): string | null;
}
