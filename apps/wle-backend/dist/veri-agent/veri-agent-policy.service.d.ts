import { type VeriAgentModeId } from './veri-agent-modes';
import type { VeriAgentModeOverride, VeriAgentPurpose, VeriAgentTenant } from './veri-agent.types';
export declare class VeriAgentPolicyService {
    private readonly logger;
    isLlmEgressEnabled(): boolean;
    isProviderConfigured(): boolean;
    isEmbeddingConfigured(): boolean;
    embeddingEndpoint(): string;
    embeddingModel(): string;
    assertTenant(tenant: VeriAgentTenant | undefined): tenant is VeriAgentTenant;
    isPurposeAllowed(purpose: VeriAgentPurpose): boolean;
    allowImageEgress(purpose: VeriAgentPurpose): boolean;
    defaultModel(): string;
    endpoint(): string;
    apiKey(): string;
    resolveMode(override?: VeriAgentModeOverride): VeriAgentModeId;
    modeSystemPrompt(override?: VeriAgentModeOverride): string | null;
}
