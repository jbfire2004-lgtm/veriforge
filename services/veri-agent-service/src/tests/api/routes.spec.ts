import { beforeAll, describe, expect, it } from "vitest";
import pino from "pino";
import { loadConfig } from "../../config";
import { createContainer } from "../../core/container";
import { buildApp } from "../../api/app";
import type { FastifyInstance } from "fastify";

describe("API routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.AUTH_DEV_BYPASS = "true";
    process.env.VERA_AGENT_LLM_ENABLED = "true";
    process.env.VERA_AGENT_ALLOW_IMAGE_EGRESS = "false";
    process.env.REDIS_ENABLED = "false";

    const config = loadConfig({
      ...process.env,
      NODE_ENV: "test",
      REDIS_ENABLED: "false",
      AUTH_DEV_BYPASS: "true",
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

  it("GET /health/live", async () => {
    const res = await app.inject({ method: "GET", url: "/health/live" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok" });
  });

  it("POST /veriagent/flha/analyze", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/flha/analyze",
      payload: {
        tenant: { companyId: 12, projectId: 44 },
        actor: { userId: 9, roles: ["SAFETY_LEAD"] },
        visibility: "in_review",
        flha: {
          title: "Excavation",
          hazards: [
            {
              description: "Unprotected edge",
              energyType: "gravitational",
              controls: ["Barricades"],
              residualRisk: "high",
            },
          ],
        },
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.hazards).toHaveLength(1);
    expect(body.meta.correlationId).toBeTruthy();
  });

  it("POST /veriagent/image/describe (text-only path)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/image/describe",
      payload: {
        tenant: { companyId: 12 },
        actor: { roles: ["SAFETY_LEAD"] },
        image: { caption: "Missing midrail on scaffold bay 3" },
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.meta.imageSent).toBe(false);
    expect(body.local.description).toContain("Missing midrail");
  });

  it("denies sealed FLHA", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/flha/analyze",
      payload: {
        tenant: { companyId: 1 },
        actor: { roles: ["CONTRACTOR"] },
        visibility: "sealed",
        flha: { narrative: "done" },
      },
    });
    expect(res.statusCode).toBe(403);
  });
});
