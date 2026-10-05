import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';
import { VeriAgentPolicyService } from './veri-agent-policy.service';
import { VeriAgentRedactionService } from './veri-agent-redaction.service';
import {
  VeriAgentRemoteClient,
  isRemoteTransportError,
} from './veri-agent-remote.client';
import type {
  VeriAgentCompleteRequest,
  VeriAgentCompleteResult,
  VeriAgentEmbedRequest,
  VeriAgentEmbedResult,
  VeriAgentEgressAuditMeta,
  VeriAgentMultimodalRequest,
} from './veri-agent.types';

/**
 * VeriAgent orchestrator — sole approved path for LLM provider egress.
 * Validate → policy → redact → call → sanitize → audit (no payloads).
 *
 * When VERA_AGENT_REMOTE_URL is set, prefers the microservice; otherwise
 * (default) uses the in-process path unchanged. Non-strict remote failures
 * fall back to in-process so VeriForge features keep working.
 */
@Injectable()
export class VeriAgentService {
  private readonly logger = new Logger(VeriAgentService.name);

  constructor(
    private readonly policy: VeriAgentPolicyService,
    private readonly redaction: VeriAgentRedactionService,
    private readonly auditLog: AuditLogService,
    private readonly remote: VeriAgentRemoteClient,
  ) {}

  isConfigured(): boolean {
    return this.policy.isProviderConfigured() && this.policy.isLlmEgressEnabled();
  }

  isEmbeddingConfigured(): boolean {
    return (
      this.policy.isEmbeddingConfigured() && this.policy.isLlmEgressEnabled()
    );
  }

  /** Redact JSON context for copilot / callers that still build prompts upstream. */
  prepareContext(context: Record<string, unknown>): Record<string, unknown> {
    return this.redaction.redactJsonContext(context) as Record<string, unknown>;
  }

  async embed(req: VeriAgentEmbedRequest): Promise<VeriAgentEmbedResult> {
    if (this.remote.isEnabled()) {
      const remoteResult = await this.remote.embed(req);
      if (!isRemoteTransportError(remoteResult)) {
        await this.auditEmbedResult(req, remoteResult);
        return remoteResult;
      }
      if (this.remote.isStrict()) {
        this.logger.warn(
          `VeriAgent remote embed strict failure: ${remoteResult.message}`,
        );
        await this.auditFailure(req, 'provider_error', false, 0, '');
        return {
          ok: false,
          reason: 'provider_error',
          detail: remoteResult.message,
        };
      }
      this.logger.warn(
        `VeriAgent remote embed failed (${remoteResult.message}); falling back in-process`,
      );
    }
    return this.embedLocal(req);
  }

  async completeJson<T extends Record<string, unknown>>(
    req: VeriAgentCompleteRequest,
  ): Promise<VeriAgentCompleteResult<T>> {
    const enriched = this.applyModeToCompleteRequest(req);
    if (this.remote.isEnabled()) {
      const remoteResult = await this.remote.completeJson<T>(enriched);
      if (!isRemoteTransportError(remoteResult)) {
        await this.auditRemoteResult(enriched, remoteResult, false);
        return remoteResult;
      }
      if (this.remote.isStrict()) {
        this.logger.warn(
          `VeriAgent remote strict failure: ${remoteResult.message}`,
        );
        await this.auditFailure(enriched, 'provider_error', false, 0, '');
        return {
          ok: false,
          reason: 'provider_error',
          detail: remoteResult.message,
        };
      }
      this.logger.warn(
        `VeriAgent remote failed (${remoteResult.message}); falling back in-process`,
      );
    }
    return this.completeJsonLocal(enriched);
  }

  async completeMultimodalJson<T extends Record<string, unknown>>(
    req: VeriAgentMultimodalRequest,
  ): Promise<VeriAgentCompleteResult<T>> {
    const enriched = this.applyModeToMultimodalRequest(req);
    if (this.remote.isEnabled()) {
      const remoteResult = await this.remote.completeMultimodalJson<T>(enriched);
      if (!isRemoteTransportError(remoteResult)) {
        await this.auditRemoteResult(
          enriched,
          remoteResult,
          Boolean(enriched.imageBase64),
        );
        return remoteResult;
      }
      if (this.remote.isStrict()) {
        this.logger.warn(
          `VeriAgent remote strict multimodal failure: ${remoteResult.message}`,
        );
        await this.auditFailure(enriched, 'provider_error', false, 0, '');
        return {
          ok: false,
          reason: 'provider_error',
          detail: remoteResult.message,
        };
      }
      this.logger.warn(
        `VeriAgent remote multimodal failed (${remoteResult.message}); falling back in-process`,
      );
    }
    return this.completeMultimodalJsonLocal(enriched);
  }

  /** Inject industry operating mode as a leading system message when active. */
  private applyModeToCompleteRequest(
    req: VeriAgentCompleteRequest,
  ): VeriAgentCompleteRequest {
    const modePrompt = this.policy.modeSystemPrompt(req.mode);
    if (!modePrompt) return req;
    const already =
      req.messages[0]?.role === 'system' &&
      req.messages[0].content.startsWith('VERIAGENT OPERATING MODE:');
    if (already) return req;
    return {
      ...req,
      messages: [{ role: 'system', content: modePrompt }, ...req.messages],
    };
  }

  private applyModeToMultimodalRequest(
    req: VeriAgentMultimodalRequest,
  ): VeriAgentMultimodalRequest {
    const modePrompt = this.policy.modeSystemPrompt(req.mode);
    if (!modePrompt) return req;
    if (req.system.startsWith('VERIAGENT OPERATING MODE:')) return req;
    return {
      ...req,
      system: `${modePrompt}\n\n${req.system}`,
    };
  }

  private async embedLocal(
    req: VeriAgentEmbedRequest,
  ): Promise<VeriAgentEmbedResult> {
    if (!this.policy.isLlmEgressEnabled()) {
      return { ok: false, reason: 'llm_disabled' };
    }
    if (!this.policy.isEmbeddingConfigured()) {
      return { ok: false, reason: 'not_configured' };
    }
    if (!this.policy.assertTenant(req.tenant)) {
      return { ok: false, reason: 'tenant_required' };
    }
    if (!this.policy.isPurposeAllowed(req.purpose)) {
      return { ok: false, reason: 'purpose_denied' };
    }

    const requireClean = req.requireCleanRedaction !== false;
    const { text, ok: redactionOk } = this.redaction.redactText(req.text);
    if (requireClean && !redactionOk) {
      await this.auditFailure(req, 'redaction_failed', false, 0, '');
      return { ok: false, reason: 'redaction_failed' };
    }

    const model = req.model ?? this.policy.embeddingModel();
    try {
      const embedding = await this.providerEmbed({
        model,
        input: text.slice(0, 8000),
      });
      if (!embedding?.length) {
        await this.auditFailure(
          req,
          'provider_error',
          true,
          text.length,
          this.redaction.hashForAudit(text),
        );
        return { ok: false, reason: 'provider_error' };
      }
      await this.auditSuccess(req, true, false, text, model);
      return {
        ok: true,
        embedding,
        meta: {
          purpose: 'lesson_embedding',
          companyId: req.tenant.companyId,
          projectId: req.tenant.projectId,
          redacted: true,
          model,
          dimensions: embedding.length,
        },
      };
    } catch (e) {
      this.logger.warn(
        `VeriAgent embed error: ${e instanceof Error ? e.message : String(e)}`,
      );
      return { ok: false, reason: 'provider_error', detail: 'fetch_failed' };
    }
  }

  private async completeJsonLocal<T extends Record<string, unknown>>(
    req: VeriAgentCompleteRequest,
  ): Promise<VeriAgentCompleteResult<T>> {
    const gate = this.gate(req.purpose, req.tenant);
    if (gate.ok === false) return gate;

    const requireClean = req.requireCleanRedaction !== false;
    let redactionOk = true;
    const cleanMessages = req.messages.map((m) => {
      if (m.role === 'system') return { role: m.role, content: m.content };
      const { text, ok } = this.redaction.redactText(m.content);
      if (!ok) redactionOk = false;
      return { role: m.role, content: text };
    });
    if (requireClean && !redactionOk) {
      await this.auditFailure(req, 'redaction_failed', false, 0, '');
      return { ok: false, reason: 'redaction_failed' };
    }
    const promptForHash = cleanMessages.map((m) => m.content).join('\n');
    const model = req.model ?? this.policy.defaultModel();

    try {
      const raw = await this.providerChat({
        model,
        temperature: req.temperature ?? 0.1,
        messages: cleanMessages,
      });
      if (!raw) {
        await this.auditFailure(
          req,
          'provider_error',
          true,
          promptForHash.length,
          this.redaction.hashForAudit(promptForHash),
        );
        return { ok: false, reason: 'provider_error' };
      }
      let parsed: T;
      try {
        parsed = JSON.parse(raw) as T;
      } catch {
        await this.auditFailure(
          req,
          'parse_error',
          true,
          promptForHash.length,
          this.redaction.hashForAudit(promptForHash),
        );
        return { ok: false, reason: 'parse_error' };
      }
      const data = this.redaction.sanitizeModelJson(parsed);
      await this.auditSuccess(req, true, false, promptForHash, model);
      return {
        ok: true,
        data,
        meta: {
          purpose: req.purpose,
          companyId: req.tenant.companyId,
          projectId: req.tenant.projectId,
          redacted: true,
          imageSent: false,
          model,
        },
      };
    } catch (e) {
      this.logger.warn(
        `VeriAgent completeJson error: ${e instanceof Error ? e.message : String(e)}`,
      );
      return { ok: false, reason: 'provider_error', detail: 'fetch_failed' };
    }
  }

  private async completeMultimodalJsonLocal<T extends Record<string, unknown>>(
    req: VeriAgentMultimodalRequest,
  ): Promise<VeriAgentCompleteResult<T>> {
    const gate = this.gate(req.purpose, req.tenant);
    if (gate.ok === false) return gate;

    const wantImage = Boolean(req.imageBase64);
    if (wantImage && !this.policy.allowImageEgress(req.purpose)) {
      await this.auditFailure(req, 'image_egress_denied', false, 0, '');
      return { ok: false, reason: 'image_egress_denied' };
    }

    const requireClean = req.requireCleanRedaction !== false;
    const redactedSystem = this.redaction.redactText(req.system);
    const redactedUser = this.redaction.redactText(req.userText);
    if (requireClean && (!redactedSystem.ok || !redactedUser.ok)) {
      await this.auditFailure(req, 'redaction_failed', false, 0, '');
      return { ok: false, reason: 'redaction_failed' };
    }

    const userContent:
      | string
      | Array<Record<string, unknown>> = wantImage
      ? [
          { type: 'text', text: redactedUser.text },
          {
            type: 'image_url',
            image_url: {
              url: `data:${req.imageMimeType ?? 'image/jpeg'};base64,${req.imageBase64}`,
            },
          },
        ]
      : redactedUser.text;

    const model = req.model ?? this.policy.defaultModel();
    const promptForHash = `${redactedSystem.text}\n${redactedUser.text}`;

    try {
      const raw = await this.providerChat({
        model,
        temperature: req.temperature ?? 0.15,
        messages: [
          { role: 'system', content: redactedSystem.text },
          { role: 'user', content: userContent },
        ],
      });
      if (!raw) {
        await this.auditFailure(
          req,
          'provider_error',
          true,
          promptForHash.length,
          this.redaction.hashForAudit(promptForHash),
          wantImage,
        );
        return { ok: false, reason: 'provider_error' };
      }
      let parsed: T;
      try {
        parsed = JSON.parse(raw) as T;
      } catch {
        return { ok: false, reason: 'parse_error' };
      }
      const data = this.redaction.sanitizeModelJson(parsed);
      await this.auditSuccess(req, true, wantImage, promptForHash, model);
      return {
        ok: true,
        data,
        meta: {
          purpose: req.purpose,
          companyId: req.tenant.companyId,
          projectId: req.tenant.projectId,
          redacted: true,
          imageSent: wantImage,
          model,
        },
      };
    } catch (e) {
      this.logger.warn(
        `VeriAgent multimodal error: ${e instanceof Error ? e.message : String(e)}`,
      );
      return { ok: false, reason: 'provider_error' };
    }
  }

  private gate(
    purpose: VeriAgentCompleteRequest['purpose'],
    tenant: VeriAgentCompleteRequest['tenant'],
  ): VeriAgentCompleteResult<never> | { ok: true } {
    if (!this.policy.isLlmEgressEnabled()) {
      return { ok: false, reason: 'llm_disabled' };
    }
    if (!this.policy.isProviderConfigured()) {
      return { ok: false, reason: 'not_configured' };
    }
    if (!this.policy.assertTenant(tenant)) {
      return { ok: false, reason: 'tenant_required' };
    }
    if (!this.policy.isPurposeAllowed(purpose)) {
      return { ok: false, reason: 'purpose_denied' };
    }
    return { ok: true };
  }

  private async providerChat(params: {
    model: string;
    temperature: number;
    messages: Array<{ role: string; content: unknown }>;
  }): Promise<string | null> {
    const res = await fetch(this.policy.endpoint(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.policy.apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        temperature: params.temperature,
        response_format: { type: 'json_object' },
        messages: params.messages,
      }),
    });
    if (!res.ok) {
      this.logger.warn(`VeriAgent provider failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  }

  private async providerEmbed(params: {
    model: string;
    input: string;
  }): Promise<number[] | null> {
    const res = await fetch(this.policy.embeddingEndpoint(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.policy.apiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        input: params.input,
      }),
    });
    if (!res.ok) {
      this.logger.warn(`VeriAgent embedding provider failed: ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    return data.data?.[0]?.embedding ?? null;
  }

  private async auditEmbedResult(
    req: {
      purpose: VeriAgentEgressAuditMeta['purpose'];
      tenant: { companyId: number; projectId?: number };
      actor?: { userId?: number; role?: string };
    },
    result: VeriAgentEmbedResult,
  ) {
    if (result.ok === true) {
      await this.writeAudit({
        purpose: req.purpose,
        companyId: req.tenant.companyId,
        projectId: req.tenant.projectId,
        actorUserId: req.actor?.userId,
        actorRole: req.actor?.role,
        model: result.meta.model,
        imageSent: false,
        redactionOk: result.meta.redacted,
        promptCharCount: 0,
        promptHash: 'remote',
        outcome: 'success',
      });
    } else {
      await this.auditFailure(req, result.reason, false, 0, '');
    }
  }

  private async auditRemoteResult(
    req: {
      purpose: VeriAgentEgressAuditMeta['purpose'];
      tenant: { companyId: number; projectId?: number };
      actor?: { userId?: number; role?: string };
    },
    result: VeriAgentCompleteResult<Record<string, unknown>>,
    imageSentFallback: boolean,
  ) {
    if (result.ok === true) {
      await this.writeAudit({
        purpose: req.purpose,
        companyId: req.tenant.companyId,
        projectId: req.tenant.projectId,
        actorUserId: req.actor?.userId,
        actorRole: req.actor?.role,
        model: result.meta.model,
        imageSent: result.meta.imageSent,
        redactionOk: result.meta.redacted,
        promptCharCount: 0,
        promptHash: 'remote',
        outcome: 'success',
      });
    } else {
      await this.auditFailure(
        req,
        result.reason,
        false,
        0,
        '',
        imageSentFallback,
      );
    }
  }

  private async auditSuccess(
    req: { purpose: VeriAgentEgressAuditMeta['purpose']; tenant: { companyId: number; projectId?: number }; actor?: { userId?: number; role?: string } },
    redactionOk: boolean,
    imageSent: boolean,
    promptText: string,
    model: string,
  ) {
    await this.writeAudit({
      purpose: req.purpose,
      companyId: req.tenant.companyId,
      projectId: req.tenant.projectId,
      actorUserId: req.actor?.userId,
      actorRole: req.actor?.role,
      model,
      imageSent,
      redactionOk,
      promptCharCount: promptText.length,
      promptHash: this.redaction.hashForAudit(promptText),
      outcome: 'success',
    });
  }

  private async auditFailure(
    req: { purpose: VeriAgentEgressAuditMeta['purpose']; tenant: { companyId: number; projectId?: number }; actor?: { userId?: number; role?: string } },
    reason: string,
    redactionOk: boolean,
    promptCharCount: number,
    promptHash: string,
    imageSent = false,
  ) {
    await this.writeAudit({
      purpose: req.purpose,
      companyId: req.tenant.companyId,
      projectId: req.tenant.projectId,
      actorUserId: req.actor?.userId,
      actorRole: req.actor?.role,
      model: this.policy.defaultModel(),
      imageSent,
      redactionOk,
      promptCharCount,
      promptHash,
      outcome: 'failure',
      reason,
    });
  }

  private async writeAudit(meta: VeriAgentEgressAuditMeta) {
    try {
      await this.auditLog.logAudit(
        meta.actorUserId != null
          ? {
              id: meta.actorUserId,
              companyId: meta.companyId,
            }
          : { companyId: meta.companyId },
        AuditAction.AI_EGRESS,
        {
          type: AuditEntityType.VERI_AGENT,
          id: meta.purpose,
          tenantId: meta.companyId,
        },
        {
          companyId: meta.companyId,
          projectId: meta.projectId,
          purpose: meta.purpose,
          actorRole: meta.actorRole,
          model: meta.model,
          imageSent: meta.imageSent,
          redactionOk: meta.redactionOk,
          promptCharCount: meta.promptCharCount,
          promptHash: meta.promptHash,
          outcome: meta.outcome,
          reason: meta.reason,
        },
      );
    } catch (e) {
      this.logger.warn(
        `VeriAgent audit write failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
