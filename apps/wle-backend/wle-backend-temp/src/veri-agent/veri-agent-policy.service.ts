import { Injectable, Logger } from '@nestjs/common';
import {
  activeModeFromEnv,
  getVeriAgentMode,
  resolveVeriAgentMode,
  type VeriAgentModeId,
} from './veri-agent-modes';
import type {
  VeriAgentModeOverride,
  VeriAgentPurpose,
  VeriAgentTenant,
} from './veri-agent.types';

const IMAGE_PURPOSES: ReadonlySet<VeriAgentPurpose> = new Set([
  'safety_photo_classify',
  'inspection_photo_findings',
  'equipment_inspection_photo_findings',
]);

@Injectable()
export class VeriAgentPolicyService {
  private readonly logger = new Logger(VeriAgentPolicyService.name);

  /** Master kill switch — defaults to enabled when LLM endpoint is configured. */
  isLlmEgressEnabled(): boolean {
    const flag = process.env.VERA_AGENT_LLM_ENABLED ?? process.env.SMS_LLM_ENABLED;
    if (flag === '0' || flag === 'false' || flag === 'off') return false;
    if (flag === '1' || flag === 'true' || flag === 'on') return true;
    // Default: allow when endpoint+key exist (backward compatible)
    return true;
  }

  isProviderConfigured(): boolean {
    return Boolean(
      process.env.VERA_LLM_ENDPOINT &&
        (process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY),
    );
  }

  /**
   * Embedding provider — VERA_EMBEDDING_ENDPOINT or OpenAI-compatible LLM keys.
   * Independent of chat/completions endpoint so lessons can embed without chat.
   */
  isEmbeddingConfigured(): boolean {
    if (process.env.VERA_EMBEDDING_ENDPOINT?.trim()) {
      return Boolean(
        process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY,
      );
    }
    return Boolean(
      process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY,
    );
  }

  embeddingEndpoint(): string {
    if (process.env.VERA_EMBEDDING_ENDPOINT?.trim()) {
      return process.env.VERA_EMBEDDING_ENDPOINT.trim();
    }
    return 'https://api.openai.com/v1/embeddings';
  }

  embeddingModel(): string {
    return process.env.VERA_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  }

  assertTenant(tenant: VeriAgentTenant | undefined): tenant is VeriAgentTenant {
    return (
      !!tenant &&
      typeof tenant.companyId === 'number' &&
      Number.isFinite(tenant.companyId) &&
      tenant.companyId > 0
    );
  }

  isPurposeAllowed(purpose: VeriAgentPurpose): boolean {
    const deny = (process.env.VERA_AGENT_DENIED_PURPOSES ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return !deny.includes(purpose);
  }

  /**
   * Image egress is purpose-bound. Set VERA_AGENT_ALLOW_IMAGE_EGRESS=false
   * to force text-only for all purposes (local vision still works upstream).
   */
  allowImageEgress(purpose: VeriAgentPurpose): boolean {
    const flag = process.env.VERA_AGENT_ALLOW_IMAGE_EGRESS;
    if (flag === '0' || flag === 'false' || flag === 'off') {
      this.logger.warn(`Image egress disabled by policy (purpose=${purpose})`);
      return false;
    }
    return IMAGE_PURPOSES.has(purpose);
  }

  defaultModel(): string {
    return process.env.VERA_LLM_MODEL ?? 'gpt-4o-mini';
  }

  endpoint(): string {
    return process.env.VERA_LLM_ENDPOINT ?? '';
  }

  apiKey(): string {
    return process.env.OPENAI_API_KEY ?? process.env.VERA_LLM_API_KEY ?? '';
  }

  /**
   * Active industry operating mode.
   * Request override wins; else VERA_AGENT_MODE (manufacturing | construction | mining | telecom | power | nuclear | multi | none).
   */
  resolveMode(override?: VeriAgentModeOverride): VeriAgentModeId {
    if (override !== undefined) return resolveVeriAgentMode(override);
    return activeModeFromEnv();
  }

  /** System prompt for the resolved mode, or null when mode is none. */
  modeSystemPrompt(override?: VeriAgentModeOverride): string | null {
    const mode = getVeriAgentMode(this.resolveMode(override));
    return mode?.systemPrompt ?? null;
  }
}
