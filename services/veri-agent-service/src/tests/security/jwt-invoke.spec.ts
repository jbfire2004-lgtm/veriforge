import { beforeAll, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import pino from "pino";
import type { FastifyInstance } from "fastify";
import { loadConfig } from "../../config";
import { createContainer } from "../../core/container";
import { buildApp } from "../../api/app";

const SECRET = "test-jwt-secret-veri-agent";

async function mintToken(opts?: {
  companyId?: number;
  aud?: string;
  iss?: string;
}): Promise<string> {
  return new SignJWT({
    companyId: opts?.companyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(opts?.iss ?? "veriforge")
    .setAudience(opts?.aud ?? "veri-agent")
    .setSubject("nest-veri-agent")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(SECRET));
}

describe("JWT auth + /v1/invoke", () => {
  describe("boot guards", () => {
    it("refuses AUTH_DEV_BYPASS in production", () => {
      expect(() =>
        loadConfig({
          NODE_ENV: "production",
          AUTH_DEV_BYPASS: "true",
          JWT_SECRET: SECRET,
        }),
      ).toThrow(/AUTH_DEV_BYPASS/);
    });

    it("requires JWT_SECRET when bypass disabled", () => {
      expect(() =>
        loadConfig({
          NODE_ENV: "development",
          AUTH_DEV_BYPASS: "false",
          JWT_SECRET: "",
        }),
      ).toThrow(/JWT_SECRET/);
    });
  });

  describe("enforced JWT", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      const config = loadConfig({
        NODE_ENV: "test",
        AUTH_DEV_BYPASS: "false",
        JWT_SECRET: SECRET,
        JWT_ISSUER: "veriforge",
        JWT_AUDIENCE: "veri-agent",
        REDIS_ENABLED: "false",
        VERA_AGENT_LLM_ENABLED: "true",
        VERA_AGENT_ALLOW_IMAGE_EGRESS: "false",
      });
      const log = pino({ level: "silent" });
      const container = createContainer({
        config,
        log,
        db: null,
        redis: null,
      });
      app = await buildApp(container);
      await app.ready();
    });

    it("allows health without token", async () => {
      const res = await app.inject({ method: "GET", url: "/health/live" });
      expect(res.statusCode).toBe(200);
    });

    it("rejects /v1/invoke without token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke",
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 12 },
          messages: [{ role: "user", content: '{"q":1}' }],
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it("rejects invalid token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke",
        headers: { authorization: "Bearer not-a-jwt" },
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 12 },
          messages: [{ role: "user", content: '{"q":1}' }],
        },
      });
      expect(res.statusCode).toBe(401);
    });

    it("accepts valid token and returns Nest complete shape", async () => {
      const token = await mintToken({ companyId: 12 });
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 12, projectId: 44 },
          actor: { userId: 9, role: "SAFETY_LEAD" },
          messages: [
            { role: "system", content: "Return JSON" },
            { role: "user", content: "Summarize site risks" },
          ],
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.meta.purpose).toBe("vsi_copilot");
      expect(body.meta.companyId).toBe(12);
      expect(body.data).toBeTruthy();
    });

    it("rejects when JWT lacks companyId but tenant is present", async () => {
      const token = await mintToken();
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 12 },
          messages: [{ role: "user", content: "x" }],
        },
      });
      expect(res.statusCode).toBe(403);
    });

    it("rejects tenant mismatch when JWT has companyId", async () => {
      const token = await mintToken({ companyId: 99 });
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 12 },
          messages: [{ role: "user", content: "x" }],
        },
      });
      expect(res.statusCode).toBe(403);
    });

    it("returns purpose_denied for denied purposes", async () => {
      const deniedApp = await buildApp(
        createContainer({
          config: loadConfig({
            NODE_ENV: "test",
            AUTH_DEV_BYPASS: "false",
            JWT_SECRET: SECRET,
            REDIS_ENABLED: "false",
            VERA_AGENT_DENIED_PURPOSES: "vsi_copilot",
          }),
          log: pino({ level: "silent" }),
          db: null,
          redis: null,
        }),
      );
      await deniedApp.ready();
      const token = await mintToken({ companyId: 1 });
      const res = await deniedApp.inject({
        method: "POST",
        url: "/v1/invoke",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "vsi_copilot",
          tenant: { companyId: 1 },
          messages: [{ role: "user", content: "x" }],
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        ok: false,
        reason: "purpose_denied",
      });
      await deniedApp.close();
    });

    it("multimodal denies image when egress disabled", async () => {
      const token = await mintToken({ companyId: 12 });
      const res = await app.inject({
        method: "POST",
        url: "/v1/invoke/multimodal",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "inspection_photo_findings",
          tenant: { companyId: 12 },
          system: "Return findings JSON",
          userText: "Scaffold bay",
          imageBase64: "AAAA",
          imageMimeType: "image/jpeg",
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        ok: false,
        reason: "image_egress_denied",
      });
    });

    it("POST /v1/embed returns not_configured without API key", async () => {
      const token = await mintToken({ companyId: 12 });
      const res = await app.inject({
        method: "POST",
        url: "/v1/embed",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          purpose: "lesson_embedding",
          tenant: { companyId: 12 },
          text: "Missing midrail on scaffold",
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        ok: false,
        reason: "not_configured",
      });
    });
  });
});
