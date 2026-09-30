import type { FastifyInstance } from "fastify";
import type { AppContainer } from "../core/container";
import { VeriAgentPipeline } from "./pipeline";
import {
  flhaAnalyzeBodySchema,
  imageDescribeBodySchema,
  embedBodySchema,
  invokeBodySchema,
  invokeMultimodalBodySchema,
  reviewFlhaAnalyzeBodySchema,
  reviewFlhaCreateBodySchema,
} from "./schemas";
import {
  assertTenantMatchesJwt,
  createAbusePreHandler,
  createRateLimitPreHandler,
  createValidationPreHandler,
  recordSecurityDenial,
} from "../security";
import { VeriAgentError } from "../core/types";

function rethrowWithDenialTracking(
  security: AppContainer["security"],
  req: Parameters<typeof recordSecurityDenial>[1],
  err: unknown,
): never {
  if (err instanceof VeriAgentError && err.statusCode === 403) {
    recordSecurityDenial(security, req, "policy_denied");
  }
  if (err instanceof VeriAgentError && err.statusCode === 422) {
    recordSecurityDenial(security, req, "privacy_denied");
  }
  throw err;
}

export async function registerRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const pipeline = new VeriAgentPipeline(container);
  const security = container.security;

  app.get("/health/live", async () => ({ status: "ok", service: "veri-agent" }));

  app.get("/health/ready", async (_req, reply) => {
    const ready = await container.ready();
    const ok =
      ready.database || container.config.NODE_ENV !== "production";
    const redisOk = !container.config.REDIS_ENABLED || ready.redis;
    if (!ok || !redisOk) {
      return reply.status(503).send({
        status: "not_ready",
        checks: ready,
      });
    }
    return { status: "ready", checks: ready };
  });

  const invokeHooks = [
    createAbusePreHandler(security, "invoke.complete"),
    createRateLimitPreHandler(security, "invoke.complete"),
    createValidationPreHandler(invokeBodySchema, security, "invoke.complete"),
  ];

  app.post("/v1/invoke", { preHandler: invokeHooks }, async (req, reply) => {
    const body =
      (req as typeof req & { validatedBody?: unknown }).validatedBody ??
      invokeBodySchema.parse(req.body);
    const parsed = invokeBodySchema.parse(body);
    assertTenantMatchesJwt(req, parsed.tenant.companyId);
    const correlationId = parsed.correlationId ?? req.correlationId;
    try {
      const result = await pipeline.invokeComplete(parsed, correlationId);
      return reply.status(200).send(result);
    } catch (err) {
      rethrowWithDenialTracking(security, req, err);
    }
  });

  const invokeMmHooks = [
    createAbusePreHandler(security, "invoke.multimodal"),
    createRateLimitPreHandler(security, "invoke.multimodal"),
    createValidationPreHandler(
      invokeMultimodalBodySchema,
      security,
      "invoke.multimodal",
    ),
  ];

  app.post(
    "/v1/invoke/multimodal",
    { preHandler: invokeMmHooks },
    async (req, reply) => {
      const body =
        (req as typeof req & { validatedBody?: unknown }).validatedBody ??
        invokeMultimodalBodySchema.parse(req.body);
      const parsed = invokeMultimodalBodySchema.parse(body);
      assertTenantMatchesJwt(req, parsed.tenant.companyId);
      const correlationId = parsed.correlationId ?? req.correlationId;
      try {
        const result = await pipeline.invokeMultimodal(parsed, correlationId);
        return reply.status(200).send(result);
      } catch (err) {
        rethrowWithDenialTracking(security, req, err);
      }
    },
  );

  const embedHooks = [
    createAbusePreHandler(security, "invoke.embed"),
    createRateLimitPreHandler(security, "invoke.embed"),
    createValidationPreHandler(embedBodySchema, security, "invoke.embed"),
  ];

  app.post("/v1/embed", { preHandler: embedHooks }, async (req, reply) => {
    const body =
      (req as typeof req & { validatedBody?: unknown }).validatedBody ??
      embedBodySchema.parse(req.body);
    const parsed = embedBodySchema.parse(body);
    assertTenantMatchesJwt(req, parsed.tenant.companyId);
    const correlationId = parsed.correlationId ?? req.correlationId;
    try {
      const result = await pipeline.invokeEmbed(parsed, correlationId);
      return reply.status(200).send(result);
    } catch (err) {
      rethrowWithDenialTracking(security, req, err);
    }
  });

  const flhaHooks = [
    createAbusePreHandler(security, "flha.analyze"),
    createRateLimitPreHandler(security, "flha.analyze"),
    createValidationPreHandler(flhaAnalyzeBodySchema, security, "flha.analyze"),
  ];

  app.post(
    "/veriagent/flha/analyze",
    { preHandler: flhaHooks },
    async (req, reply) => {
      const body =
        (req as typeof req & { validatedBody?: unknown }).validatedBody ??
        flhaAnalyzeBodySchema.parse(req.body);
      const parsed = flhaAnalyzeBodySchema.parse(body);
      assertTenantMatchesJwt(req, parsed.tenant.companyId);
      const correlationId = parsed.correlationId ?? req.correlationId;
      try {
        const result = await pipeline.analyzeFlha(parsed, correlationId);
        return reply.status(200).send(result);
      } catch (err) {
        rethrowWithDenialTracking(security, req, err);
      }
    },
  );

  const reviewCreateHooks = [
    createAbusePreHandler(security, "flha.review_create"),
    createRateLimitPreHandler(security, "flha.review_create"),
    createValidationPreHandler(
      reviewFlhaCreateBodySchema,
      security,
      "flha.review_create",
    ),
  ];

  app.post(
    "/veriagent/review-flha/create",
    { preHandler: reviewCreateHooks },
    async (req, reply) => {
      const body =
        (req as typeof req & { validatedBody?: unknown }).validatedBody ??
        reviewFlhaCreateBodySchema.parse(req.body);
      const parsed = reviewFlhaCreateBodySchema.parse(body);
      assertTenantMatchesJwt(req, parsed.tenant.companyId);
      const correlationId = parsed.correlationId ?? req.correlationId;
      try {
        const result = await pipeline.createReviewFlha(parsed, correlationId);
        return reply.status(201).send(result);
      } catch (err) {
        rethrowWithDenialTracking(security, req, err);
      }
    },
  );

  const reviewAnalyzeHooks = [
    createAbusePreHandler(security, "flha.review"),
    createRateLimitPreHandler(security, "flha.review"),
    createValidationPreHandler(
      reviewFlhaAnalyzeBodySchema,
      security,
      "flha.review",
    ),
  ];

  app.post(
    "/veriagent/review-flha/analyze",
    { preHandler: reviewAnalyzeHooks },
    async (req, reply) => {
      const body =
        (req as typeof req & { validatedBody?: unknown }).validatedBody ??
        reviewFlhaAnalyzeBodySchema.parse(req.body);
      const parsed = reviewFlhaAnalyzeBodySchema.parse(body);
      assertTenantMatchesJwt(req, parsed.tenant.companyId);
      const correlationId = parsed.correlationId ?? req.correlationId;
      try {
        const result = await pipeline.analyzeReviewFlha(parsed, correlationId);
        return reply.status(200).send(result);
      } catch (err) {
        rethrowWithDenialTracking(security, req, err);
      }
    },
  );

  const imageHooks = [
    createAbusePreHandler(security, "image.describe"),
    createRateLimitPreHandler(security, "image.describe"),
    createValidationPreHandler(
      imageDescribeBodySchema,
      security,
      "image.describe",
    ),
  ];

  app.post(
    "/veriagent/image/describe",
    { preHandler: imageHooks },
    async (req, reply) => {
      const body =
        (req as typeof req & { validatedBody?: unknown }).validatedBody ??
        imageDescribeBodySchema.parse(req.body);
      const parsed = imageDescribeBodySchema.parse(body);
      assertTenantMatchesJwt(req, parsed.tenant.companyId);
      const correlationId = parsed.correlationId ?? req.correlationId;
      try {
        const result = await pipeline.describeImage(parsed, correlationId);
        return reply.status(200).send(result);
      } catch (err) {
        rethrowWithDenialTracking(security, req, err);
      }
    },
  );
}
