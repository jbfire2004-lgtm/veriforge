import type { AppContainer } from "../core/container";
import { VeriAgentError, type ActorContext, type VeriAgentRole } from "../core/types";
import { createAuditEvent } from "../logging";
import { isPrivacyBlocked } from "../privacy";
import type { HazardAbstraction } from "../core/types";
import { suggestReviewHazards } from "../review-flha";
import type {
  FlhaAnalyzeBody,
  ImageDescribeBody,
  EmbedBody,
  InvokeBody,
  InvokeMultimodalBody,
  ReviewFlhaAnalyzeBody,
  ReviewFlhaCreateBody,
} from "./schemas";

const IMAGE_EGRESS_PURPOSES = new Set([
  "safety_photo_classify",
  "inspection_photo_findings",
  "equipment_inspection_photo_findings",
]);

type NestFailReason =
  | "llm_disabled"
  | "not_configured"
  | "tenant_required"
  | "purpose_denied"
  | "redaction_failed"
  | "image_egress_denied"
  | "provider_error"
  | "parse_error";

type NestCompleteResult =
  | {
      ok: true;
      data: Record<string, unknown>;
      meta: {
        purpose: string;
        companyId: number;
        projectId?: number;
        redacted: boolean;
        imageSent: boolean;
        model: string;
      };
    }
  | { ok: false; reason: NestFailReason; detail?: string };

function nestActorToContext(
  actor: InvokeBody["actor"],
): ActorContext {
  /** Least privilege when actor omitted — never invent SAFETY_LEAD. */
  if (!actor) {
    return { roles: ["WORKER"] };
  }
  const roles: VeriAgentRole[] = [];
  if (actor.roles?.length) {
    roles.push(...actor.roles);
  } else if (actor.role) {
    const upper = actor.role.toUpperCase().replace(/\s+/g, "_");
    const allowed: VeriAgentRole[] = [
      "WORKER",
      "CONTRACTOR",
      "SAFETY_LEAD",
      "PROJECT_OWNER",
      "PROJECT_MANAGER",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
    ];
    if ((allowed as string[]).includes(upper)) {
      roles.push(upper as VeriAgentRole);
    }
  }
  if (!roles.length) roles.push("WORKER");
  return { userId: actor.userId, roles };
}

function messagesToSystemUser(messages: InvokeBody["messages"]): {
  system: string;
  userText: string;
} {
  const systemParts: string[] = [];
  const userParts: string[] = [];
  for (const m of messages) {
    if (m.role === "system") systemParts.push(m.content);
    else userParts.push(m.content);
  }
  return {
    system: systemParts.join("\n") || "Return valid JSON only.",
    userText: userParts.join("\n") || "{}",
  };
}

/**
 * Shared pipeline: policy → translation → privacy firewall → orchestration → audit.
 * Policy decides; privacy firewall enforces.
 */
export class VeriAgentPipeline {
  constructor(private readonly c: AppContainer) {}

  private requestContext(
    body: { tenant: FlhaAnalyzeBody["tenant"]; actor: FlhaAnalyzeBody["actor"] },
    correlationId: string,
  ) {
    return {
      tenant: body.tenant,
      actor: body.actor,
      correlationId,
    };
  }

  /**
   * Nest-compatible text completion (POST /v1/invoke).
   * Returns Nest VeriAgentCompleteResult shape (never throws for policy gates).
   */
  async invokeComplete(
    body: InvokeBody,
    correlationId: string,
  ): Promise<NestCompleteResult> {
    const gate = this.nestGate(body.purpose, body.tenant.companyId);
    if (!gate.ok) return gate;

    const actor = nestActorToContext(body.actor);
    const { system, userText } = messagesToSystemUser(body.messages);

    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose: body.purpose,
        tenant: body.tenant,
        actor,
        correlationId,
        purposeAllowsImage: false,
        hasRawImage: false,
        llmEnabled: this.c.config.VERA_AGENT_LLM_ENABLED !== false,
        allowImageEgressGlobal: this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS,
      },
      {
        kind: "generic",
        system,
        userText,
      },
    );

    if (isPrivacyBlocked(fw)) {
      return { ok: false, reason: "redaction_failed", detail: fw.code };
    }

    const result = await this.c.orchestrator.completeJson({
      purpose: body.purpose,
      system: fw.system,
      userText: fw.userText,
      sendImage: false,
      privacyCleared: true,
      payloadHash: fw.payloadHash,
      temperature: body.temperature,
      taskType: "json_completion",
      context: {
        tenant: body.tenant,
        correlationId,
        preferredRegion: body.tenant.region ?? this.c.config.VERA_AGENT_REGION,
        privacyMode: this.c.config.VERA_AGENT_PRIVACY_MODE,
      },
    });

    this.c.audit.auditLog(
      createAuditEvent(
        { tenant: body.tenant, actor, correlationId },
        "invoke.complete",
        { allowed: result.ok, reason: result.ok ? undefined : result.code },
        {
          endpoint: "/v1/invoke",
          purpose: body.purpose,
          outcome: result.ok ? "success" : "failure",
          imageSent: false,
          privacyDecision: fw.decision,
        },
      ),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: "provider_error",
        detail: result.code,
      };
    }

    return {
      ok: true,
      data: result.data,
      meta: {
        purpose: body.purpose,
        companyId: body.tenant.companyId,
        projectId: body.tenant.projectId,
        redacted: true,
        imageSent: false,
        model: body.model ?? result.model,
      },
    };
  }

  /**
   * Nest-compatible multimodal completion (POST /v1/invoke/multimodal).
   */
  async invokeMultimodal(
    body: InvokeMultimodalBody,
    correlationId: string,
  ): Promise<NestCompleteResult> {
    const gate = this.nestGate(body.purpose, body.tenant.companyId);
    if (!gate.ok) return gate;

    const wantImage = Boolean(body.imageBase64);
    if (
      wantImage &&
      (!IMAGE_EGRESS_PURPOSES.has(body.purpose) ||
        !this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS)
    ) {
      return { ok: false, reason: "image_egress_denied" };
    }

    const actor = nestActorToContext(body.actor);

    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose: body.purpose,
        tenant: body.tenant,
        actor,
        correlationId,
        purposeAllowsImage: IMAGE_EGRESS_PURPOSES.has(body.purpose),
        hasRawImage: wantImage,
        llmEnabled: this.c.config.VERA_AGENT_LLM_ENABLED !== false,
        allowImageEgressGlobal: this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS,
      },
      {
        kind: "image_description",
        system: body.system,
        userText: body.userText,
        rawImageBase64: wantImage ? body.imageBase64 : undefined,
        mimeType: body.imageMimeType,
      },
    );

    if (isPrivacyBlocked(fw)) {
      return { ok: false, reason: "redaction_failed", detail: fw.code };
    }

    const sendImage = wantImage && fw.imageAllowed && Boolean(fw.imageBase64);
    const result = await this.c.orchestrator.completeJson({
      purpose: body.purpose,
      system: fw.system,
      userText: fw.userText,
      sendImage,
      imageBase64: sendImage ? fw.imageBase64 : undefined,
      mimeType: sendImage ? fw.mimeType ?? body.imageMimeType : undefined,
      privacyCleared: true,
      payloadHash: fw.payloadHash,
      temperature: body.temperature,
      taskType: sendImage ? "vision" : "json_completion",
      context: {
        tenant: body.tenant,
        correlationId,
        preferredRegion: body.tenant.region ?? this.c.config.VERA_AGENT_REGION,
        privacyMode: this.c.config.VERA_AGENT_PRIVACY_MODE,
      },
    });

    this.c.audit.auditLog(
      createAuditEvent(
        { tenant: body.tenant, actor, correlationId },
        "invoke.multimodal",
        { allowed: result.ok, reason: result.ok ? undefined : result.code },
        {
          endpoint: "/v1/invoke/multimodal",
          purpose: body.purpose,
          outcome: result.ok ? "success" : "failure",
          imageSent: sendImage,
          privacyDecision: fw.decision,
        },
      ),
    );

    if (!result.ok) {
      return {
        ok: false,
        reason: "provider_error",
        detail: result.code,
      };
    }

    return {
      ok: true,
      data: result.data,
      meta: {
        purpose: body.purpose,
        companyId: body.tenant.companyId,
        projectId: body.tenant.projectId,
        redacted: true,
        imageSent: sendImage,
        model: body.model ?? result.model,
      },
    };
  }

  /**
   * Nest-compatible embedding (POST /v1/embed).
   */
  async invokeEmbed(body: EmbedBody, correlationId: string) {
    type EmbedResult =
      | {
          ok: true;
          embedding: number[];
          meta: {
            purpose: "lesson_embedding";
            companyId: number;
            projectId?: number;
            redacted: boolean;
            model: string;
            dimensions: number;
          };
        }
      | {
          ok: false;
          reason:
            | "llm_disabled"
            | "not_configured"
            | "tenant_required"
            | "purpose_denied"
            | "redaction_failed"
            | "provider_error";
          detail?: string;
        };

    const gate = this.nestGate(body.purpose, body.tenant.companyId);
    if (!gate.ok) {
      return gate as EmbedResult;
    }
    if (!this.c.config.embeddingConfigured) {
      return { ok: false, reason: "not_configured" } satisfies EmbedResult;
    }

    const actor = nestActorToContext(body.actor);
    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose: body.purpose,
        tenant: body.tenant,
        actor,
        correlationId,
        purposeAllowsImage: false,
        hasRawImage: false,
        llmEnabled: this.c.config.VERA_AGENT_LLM_ENABLED !== false,
        allowImageEgressGlobal: this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS,
      },
      {
        kind: "generic",
        userText: body.text,
      },
    );

    if (isPrivacyBlocked(fw)) {
      return {
        ok: false,
        reason: "redaction_failed",
        detail: fw.code,
      } satisfies EmbedResult;
    }

    const model = body.model ?? this.c.config.VERA_EMBEDDING_MODEL;
    const input = fw.userText.slice(0, 8000);

    try {
      const res = await fetch(this.c.config.embeddingEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.c.config.VERA_LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, input }),
      });
      if (!res.ok) {
        this.c.audit.auditLog(
          createAuditEvent(
            { tenant: body.tenant, actor, correlationId },
            "invoke.embed",
            { allowed: false, code: "provider_error" },
            {
              endpoint: "/v1/embed",
              purpose: body.purpose,
              outcome: "failure",
              imageSent: false,
            },
          ),
        );
        return {
          ok: false,
          reason: "provider_error",
          detail: `http_${res.status}`,
        } satisfies EmbedResult;
      }
      const data = (await res.json()) as {
        data?: Array<{ embedding?: number[] }>;
      };
      const embedding = data.data?.[0]?.embedding;
      if (!embedding?.length) {
        return { ok: false, reason: "provider_error" } satisfies EmbedResult;
      }

      this.c.audit.auditLog(
        createAuditEvent(
          { tenant: body.tenant, actor, correlationId },
          "invoke.embed",
          { allowed: true },
          {
            endpoint: "/v1/embed",
            purpose: body.purpose,
            outcome: "success",
            imageSent: false,
            model,
            privacyDecision: fw.decision,
          },
        ),
      );

      return {
        ok: true,
        embedding,
        meta: {
          purpose: "lesson_embedding" as const,
          companyId: body.tenant.companyId,
          projectId: body.tenant.projectId,
          redacted: true,
          model,
          dimensions: embedding.length,
        },
      } satisfies EmbedResult;
    } catch {
      return {
        ok: false,
        reason: "provider_error",
        detail: "fetch_failed",
      } satisfies EmbedResult;
    }
  }

  private nestGate(
    purpose: string,
    companyId: number,
  ): NestCompleteResult | { ok: true } {
    if (this.c.config.VERA_AGENT_LLM_ENABLED === false) {
      return { ok: false, reason: "llm_disabled" };
    }
    if (!this.c.config.llmConfigured && this.c.config.isProd) {
      return { ok: false, reason: "not_configured" };
    }
    if (!(companyId > 0)) {
      return { ok: false, reason: "tenant_required" };
    }
    if (this.c.config.deniedPurposes.has(purpose)) {
      return { ok: false, reason: "purpose_denied" };
    }
    return { ok: true };
  }

  async analyzeFlha(body: FlhaAnalyzeBody, correlationId: string) {
    const started = Date.now();
    const purpose = "flha_analyze" as const;
    const reqCtx = this.requestContext(body, correlationId);

    const flhaPrompt = this.c.translation.translateFlhaToPrompt(body.flha, {
      tenant: body.tenant,
      actorRoles: body.actor.roles,
      abstractionLevel: "relaxed",
      purpose,
      correlationId,
    });
    const hazardsIn = flhaPrompt.hazards.map((h, i) => ({
      id: `hz-${i + 1}`,
      energyType: h.energyType,
      hazardSummary: h.summary,
      controls: h.mitigationTypes,
      residualRisk: h.riskLevel,
    }));
    const policyDecision = this.c.policy.evaluatePolicy(
      {
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
      },
      "flha.analyze",
      {
        visibility: body.visibility,
        hazards: hazardsIn,
        mitigations: body.flha.tasks,
        isContractorFlha: body.visibility === "draft" || body.visibility === "contractor_only",
        isReviewFlha: body.visibility === "in_review",
      },
    );

    if (!policyDecision.allowed) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.analyze", policyDecision, {
          endpoint: "/veriagent/flha/analyze",
          purpose,
          outcome: "denied",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(
        403,
        policyDecision.code ?? "policy_denied",
        policyDecision.reason ?? "Denied by policy",
      );
    }

    const transformed = policyDecision.transformedData as {
      hazards?: HazardAbstraction[];
      mitigations?: string[];
    } | null;

    let hazards = transformed?.hazards ?? hazardsIn;
    if (
      policyDecision.enforcement?.transform === "owner_safe" ||
      policyDecision.enforcement?.transform === "aggregate_only"
    ) {
      hazards = this.c.translation.toOwnerSafe(hazards);
    }

    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose,
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
        visibility: body.visibility,
        purposeAllowsImage: false,
        hasRawImage: false,
      },
      {
        kind: "flha",
        system: flhaPrompt.systemHint,
        userText: flhaPrompt.userPrompt,
        hazards,
        mitigations: transformed?.mitigations ?? flhaPrompt.taskTypes,
      },
    );

    if (isPrivacyBlocked(fw)) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.analyze", policyDecision, {
          endpoint: "/veriagent/flha/analyze",
          purpose,
          outcome: "denied",
          policyCode: fw.code,
          policyReason: fw.message,
          privacyDecision: "blocked",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(422, fw.code, fw.message);
    }

    const result = await this.c.orchestrator.completeJson({
      purpose,
      system: fw.system,
      userText: fw.userText,
      sendImage: false,
      privacyCleared: true,
      payloadHash: fw.payloadHash,
      taskType: "recommendation",
      context: {
        tenant: body.tenant,
        correlationId,
        preferredRegion: body.tenant.region ?? this.c.config.VERA_AGENT_REGION,
        privacyMode: "strict",
      },
    });
    if (!result.ok) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.analyze", policyDecision, {
          endpoint: "/veriagent/flha/analyze",
          purpose,
          outcome: "failure",
          policyCode: result.code,
          policyReason: result.message,
          privacyDecision: fw.decision,
          imageSent: false,
          promptHash: fw.payloadHash,
          promptCharCount: fw.userText.length + fw.system.length,
          latencyMs: Date.now() - started,
        }),
      );
      throw new VeriAgentError(502, result.code, result.message);
    }

    this.c.audit.auditLog(
      createAuditEvent(reqCtx, "flha.analyze", policyDecision, {
        endpoint: "/veriagent/flha/analyze",
        purpose,
        outcome: "success",
        privacyDecision: fw.decision,
        imageSent: false,
        promptHash: fw.payloadHash,
        promptCharCount: fw.userText.length + fw.system.length,
        responseCharCount: JSON.stringify(result.data).length,
        model: result.model,
        providerId: result.providerId,
        fallback: result.fallback,
        latencyMs: Date.now() - started,
        attempts: result.attempts,
      }),
    );

    return {
      purpose,
      tenant: body.tenant,
      transform: policyDecision.enforcement?.transform ?? "abstracted",
      flhaAudience: policyDecision.enforcement?.flhaAudience,
      hazards: fw.hazards ?? hazards,
      privacy: {
        decision: fw.decision,
        rulesApplied: fw.rulesApplied,
        redactionCount: fw.redactionCount,
      },
      policy: {
        allowed: true,
        code: policyDecision.code,
        reason: policyDecision.reason,
      },
      result: result.data,
      meta: {
        model: result.model,
        usedProvider: result.usedProvider,
        fallback: result.fallback,
        correlationId,
        tenantTag: fw.tenantTag,
      },
    };
  }

  async describeImage(body: ImageDescribeBody, correlationId: string) {
    const started = Date.now();
    const purpose = "image_describe" as const;
    const hasImage = Boolean(body.image.imageBase64);
    const reqCtx = this.requestContext(body, correlationId);
    const operation =
      hasImage && this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS
        ? ("image.analyze_raw" as const)
        : ("image.describe" as const);

    const policyDecision = this.c.policy.evaluatePolicy(
      {
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
        allowImageEgressOverride:
          this.c.config.VERA_AGENT_ALLOW_IMAGE_EGRESS === true,
      },
      operation,
      {
        caption: body.image.caption,
        hasRawImage: hasImage,
        imageBase64: body.image.imageBase64,
        mimeType: body.image.mimeType,
      },
    );

    if (!policyDecision.allowed) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, operation, policyDecision, {
          endpoint: "/veriagent/image/describe",
          purpose,
          outcome: "denied",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(
        403,
        policyDecision.code ?? "policy_denied",
        policyDecision.reason ?? "Denied by policy",
      );
    }

    const imagePrompt = this.c.translation.translateImageToPrompt(
      {
        caption: body.image.caption,
        objectKey: body.image.objectKey,
        imageBase64: body.image.imageBase64,
        mimeType: body.image.mimeType,
      },
      {
        tenant: body.tenant,
        actorRoles: body.actor.roles,
        abstractionLevel: "relaxed",
        purpose,
        correlationId,
      },
    );
    const local = {
      description: imagePrompt.sceneDescription,
      features: imagePrompt.features,
      usedRawImage: false as const,
    };
    const transformed = policyDecision.transformedData as {
      description?: string;
      features?: string[];
      imageBase64?: string;
      mimeType?: string;
    } | null;

    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose,
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
        purposeAllowsImage:
          policyDecision.enforcement?.purposeAllowsImage === true &&
          this.c.policy.purposeAllowsImage(purpose),
        hasRawImage: hasImage,
        allowImageEgressGlobal:
          policyDecision.enforcement?.allowRawImageEgress === true,
      },
      {
        kind: "image_description",
        system: imagePrompt.systemHint,
        userText: imagePrompt.userPrompt,
        imageDescription: transformed?.description || imagePrompt.sceneDescription,
        imageFeatures: transformed?.features ?? imagePrompt.features,
        rawImageBase64: policyDecision.enforcement?.allowRawImageEgress
          ? body.image.imageBase64
          : undefined,
        mimeType: body.image.mimeType,
      },
    );

    if (isPrivacyBlocked(fw)) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, operation, policyDecision, {
          endpoint: "/veriagent/image/describe",
          purpose,
          outcome: "denied",
          policyCode: fw.code,
          policyReason: fw.message,
          privacyDecision: "blocked",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(422, fw.code, fw.message);
    }

    const result = await this.c.orchestrator.completeJson({
      purpose,
      system: fw.system,
      userText: fw.userText,
      sendImage: fw.imageAllowed,
      imageBase64: fw.imageBase64,
      mimeType: fw.mimeType,
      privacyCleared: true,
      payloadHash: fw.payloadHash,
      taskType: fw.imageAllowed ? "vision" : "json_completion",
      context: {
        tenant: body.tenant,
        correlationId,
        preferredRegion: body.tenant.region ?? this.c.config.VERA_AGENT_REGION,
        privacyMode: fw.imageAllowed ? "balanced" : "strict",
      },
    });
    if (!result.ok) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, operation, policyDecision, {
          endpoint: "/veriagent/image/describe",
          purpose,
          outcome: "failure",
          policyCode: result.code,
          policyReason: result.message,
          privacyDecision: fw.decision,
          imageSent: false,
          promptHash: fw.payloadHash,
          latencyMs: Date.now() - started,
        }),
      );
      throw new VeriAgentError(502, result.code, result.message);
    }

    this.c.audit.auditLog(
      createAuditEvent(reqCtx, operation, policyDecision, {
        endpoint: "/veriagent/image/describe",
        purpose,
        outcome: "success",
        privacyDecision: fw.decision,
        imageSent: fw.imageAllowed,
        promptHash: fw.payloadHash,
        promptCharCount: fw.userText.length + fw.system.length,
        responseCharCount: JSON.stringify(result.data).length,
        model: result.model,
        providerId: result.providerId,
        fallback: result.fallback,
        latencyMs: Date.now() - started,
        attempts: result.attempts,
      }),
    );

    return {
      purpose,
      tenant: body.tenant,
      local,
      policy: {
        allowed: true,
        code: policyDecision.code,
        reason: policyDecision.reason,
        allowRawImageEgress:
          policyDecision.enforcement?.allowRawImageEgress ?? false,
      },
      privacy: {
        decision: fw.decision,
        rulesApplied: fw.rulesApplied,
        redactionCount: fw.redactionCount,
      },
      result: result.data,
      meta: {
        model: result.model,
        usedProvider: result.usedProvider,
        fallback: result.fallback,
        imageSent: fw.imageAllowed,
        correlationId,
        tenantTag: fw.tenantTag,
      },
    };
  }

  /**
   * Create a Review FLHA for active-area entry.
   * Independent of contractor FLHA — never reads or returns contractor content.
   */
  async createReviewFlha(body: ReviewFlhaCreateBody, correlationId: string) {
    const started = Date.now();
    const purpose = "flha_review_assist" as const;
    const reqCtx = this.requestContext(body, correlationId);

    const policyDecision = this.c.policy.evaluatePolicy(
      {
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
      },
      "flha.review_create",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
        reviewStatus: "draft",
        hazards: [],
      },
    );

    if (!policyDecision.allowed) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.review_create", policyDecision, {
          endpoint: "/veriagent/review-flha/create",
          purpose,
          outcome: "denied",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(
        403,
        policyDecision.code ?? "policy_denied",
        policyDecision.reason ?? "Denied by policy",
      );
    }

    const suggestions = suggestReviewHazards({
      project: body.project,
      areaType: body.areaType,
      workActivities: body.workActivities,
    });

    const ownHazards = (body.hazards ?? []).map((h, i) => ({
      id: `rev-hz-${i + 1}`,
      energyType: h.energyType ?? "unspecified",
      hazardSummary: h.description.slice(0, 240),
      controls: h.controls ?? [],
      residualRisk: h.residualRisk ?? "medium",
    }));

    const reviewFlhaId = `review-${body.tenant.companyId}-${Date.now().toString(36)}`;

    this.c.audit.auditLog(
      createAuditEvent(reqCtx, "flha.review_create", policyDecision, {
        endpoint: "/veriagent/review-flha/create",
        purpose,
        outcome: "success",
        imageSent: false,
        latencyMs: Date.now() - started,
      }),
    );

    return {
      purpose,
      reviewFlha: {
        id: reviewFlhaId,
        status: "draft" as const,
        isReviewFlha: true as const,
        isContractorFlha: false as const,
        areaType: body.areaType,
        workActivities: body.workActivities ?? [],
        hazards: ownHazards,
        /** Contractor FLHA is intentionally absent */
        contractorFlhaExcluded: true as const,
      },
      suggestedHazards: suggestions,
      entryAllowed: false,
      policy: {
        allowed: true,
        flhaAudience: policyDecision.enforcement?.flhaAudience,
        reason: policyDecision.reason,
      },
      meta: {
        correlationId,
        tenant: body.tenant,
        note: "Complete Review FLHA before active-area entry. Contractor FLHA is not available to reviewers.",
      },
    };
  }

  /**
   * Analyze / assist a Review FLHA. Never accepts or uses contractor FLHA content.
   * Project owners receive aggregated/owner-safe views only.
   */
  async analyzeReviewFlha(body: ReviewFlhaAnalyzeBody, correlationId: string) {
    const started = Date.now();
    const purpose = "flha_review_assist" as const;
    const reqCtx = this.requestContext(body, correlationId);
    const status = body.markCompleted
      ? ("completed" as const)
      : body.reviewFlha.status;

    const flhaPrompt = this.c.translation.translateFlhaToPrompt(
      {
        title: `Review FLHA ${body.reviewFlha.areaType ?? "active area"}`,
        tasks: body.reviewFlha.workActivities,
        narrative: body.reviewFlha.narrative,
        hazards: body.reviewFlha.hazards,
      },
      {
        tenant: body.tenant,
        actorRoles: body.actor.roles,
        abstractionLevel: "relaxed",
        purpose,
        correlationId,
      },
    );

    const hazardsIn = flhaPrompt.hazards.map((h, i) => ({
      id: `rev-hz-${i + 1}`,
      energyType: h.energyType,
      hazardSummary: h.summary,
      controls: h.mitigationTypes,
      residualRisk: h.riskLevel,
    }));

    const policyDecision = this.c.policy.evaluatePolicy(
      {
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
      },
      "flha.review",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
        reviewStatus: status,
        hazards: hazardsIn,
      },
    );

    if (!policyDecision.allowed) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.review", policyDecision, {
          endpoint: "/veriagent/review-flha/analyze",
          purpose,
          outcome: "denied",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(
        403,
        policyDecision.code ?? "policy_denied",
        policyDecision.reason ?? "Denied by policy",
      );
    }

    const transformed = policyDecision.transformedData as {
      hazards?: HazardAbstraction[];
      safetySummary?: unknown;
    } | null;

    let hazards = transformed?.hazards ?? hazardsIn;
    if (
      policyDecision.enforcement?.transform === "owner_safe" ||
      policyDecision.enforcement?.transform === "aggregate_only"
    ) {
      hazards = this.c.translation.toOwnerSafe(hazards);
    }

    const suggestions = suggestReviewHazards({
      project: body.project,
      areaType: body.reviewFlha.areaType,
      workActivities: body.reviewFlha.workActivities,
    });

    const fw = this.c.privacy.applyPrivacyFirewall(
      {
        purpose,
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
        visibility: "in_review",
        purposeAllowsImage: false,
        hasRawImage: false,
      },
      {
        kind: "flha",
        system: flhaPrompt.systemHint,
        userText: [
          flhaPrompt.userPrompt,
          "Suggest additional generic controls for a Review FLHA. Do not reference any contractor FLHA.",
          JSON.stringify({
            suggestedPatterns: suggestions.map((s) => ({
              category: s.category,
              energyType: s.energyType,
              riskLevel: s.riskLevel,
              mitigationTypes: s.mitigationTypes,
            })),
            project: body.project
              ? {
                  environment: body.project.environment,
                  workType: body.project.workType,
                  conditions: body.project.conditions,
                }
              : undefined,
          }),
        ].join("\n\n"),
        hazards,
      },
    );

    if (isPrivacyBlocked(fw)) {
      this.c.audit.auditLog(
        createAuditEvent(reqCtx, "flha.review", policyDecision, {
          endpoint: "/veriagent/review-flha/analyze",
          purpose,
          outcome: "denied",
          policyCode: fw.code,
          policyReason: fw.message,
          privacyDecision: "blocked",
          imageSent: false,
        }),
      );
      throw new VeriAgentError(422, fw.code, fw.message);
    }

    const result = await this.c.orchestrator.completeJson({
      purpose,
      system: fw.system,
      userText: fw.userText,
      sendImage: false,
      privacyCleared: true,
      payloadHash: fw.payloadHash,
      taskType: "recommendation",
      context: {
        tenant: body.tenant,
        correlationId,
        preferredRegion: body.tenant.region ?? this.c.config.VERA_AGENT_REGION,
        privacyMode: "strict",
      },
    });
    if (!result.ok) {
      throw new VeriAgentError(502, result.code, result.message);
    }

    const entryCheck = this.c.policy.evaluatePolicy(
      {
        tenant: body.tenant,
        actor: body.actor,
        correlationId,
      },
      "flha.entry_check",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
        reviewStatus: status,
      },
    );

    this.c.audit.auditLog(
      createAuditEvent(reqCtx, "flha.review", policyDecision, {
        endpoint: "/veriagent/review-flha/analyze",
        purpose,
        outcome: "success",
        privacyDecision: fw.decision,
        imageSent: false,
        promptHash: fw.payloadHash,
        promptCharCount: fw.userText.length + fw.system.length,
        model: result.model,
        providerId: result.providerId,
        fallback: result.fallback,
        latencyMs: Date.now() - started,
      }),
    );

    return {
      purpose,
      reviewFlha: {
        id: body.reviewFlha.id,
        status,
        isReviewFlha: true as const,
        isContractorFlha: false as const,
        hazards: fw.hazards ?? hazards,
        safetySummary: transformed?.safetySummary,
        contractorFlhaExcluded: true as const,
      },
      suggestedHazards: suggestions,
      entryAllowed: entryCheck.allowed === true,
      entry: {
        allowed: entryCheck.allowed,
        code: entryCheck.code,
        reason: entryCheck.reason,
      },
      policy: {
        allowed: true,
        flhaAudience: policyDecision.enforcement?.flhaAudience,
        transform: policyDecision.enforcement?.transform,
        reason: policyDecision.reason,
      },
      privacy: {
        decision: fw.decision,
        rulesApplied: fw.rulesApplied,
        redactionCount: fw.redactionCount,
      },
      result: result.data,
      meta: {
        model: result.model,
        usedProvider: result.usedProvider,
        fallback: result.fallback,
        correlationId,
        tenantTag: fw.tenantTag,
      },
    };
  }
}
