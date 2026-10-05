export type VeriAgentModeId = 'manufacturing' | 'construction' | 'mining' | 'telecom' | 'power' | 'nuclear' | 'multi' | 'none';
export type VeriAgentModeDefinition = {
    id: Exclude<VeriAgentModeId, 'none'>;
    label: string;
    systemPrompt: string;
};
export declare const MANUFACTURING_MODE: VeriAgentModeDefinition;
export declare const CONSTRUCTION_MODE: VeriAgentModeDefinition;
export declare const MINING_MODE: VeriAgentModeDefinition;
export declare const TELECOM_MODE: VeriAgentModeDefinition;
export declare const POWER_MODE: VeriAgentModeDefinition;
export declare const NUCLEAR_MODE: VeriAgentModeDefinition;
export declare const MULTI_INDUSTRY_MODE: VeriAgentModeDefinition;
export declare function resolveVeriAgentMode(raw: string | undefined | null): VeriAgentModeId;
export declare function getVeriAgentMode(id: VeriAgentModeId): VeriAgentModeDefinition | null;
export declare function activeModeFromEnv(): VeriAgentModeId;
