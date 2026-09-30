import type { Pool } from "pg";
import type Redis from "ioredis";
import type { Logger } from "pino";
import type { AppConfig } from "../config";
import { AuditLogger } from "../logging";
import { PrivacyFirewall } from "../privacy";
import { PolicyEngine } from "../policy";
import { TranslationService } from "../translation";
import { Orchestrator } from "../orchestration";
import { VeriAgent } from "../agents";
import { createObservability, type Observability } from "../observability";
import {
  AbuseDetector,
  RateLimiter,
  createRateLimitStore,
  loadSecurityConfig,
  type SecurityServices,
} from "../security";

export type AppContainer = {
  config: AppConfig;
  log: Logger;
  audit: AuditLogger;
  privacy: PrivacyFirewall;
  policy: PolicyEngine;
  translation: TranslationService;
  orchestrator: Orchestrator;
  veriAgent: VeriAgent;
  security: SecurityServices;
  observability: Observability;
  db: Pool | null;
  redis: Redis | null;
  ready: () => Promise<{ database: boolean; redis: boolean }>;
};

export function createContainer(deps: {
  config: AppConfig;
  log: Logger;
  db: Pool | null;
  redis: Redis | null;
}): AppContainer {
  const audit = new AuditLogger(deps.log);
  const privacy = new PrivacyFirewall(
    deps.config.VERA_AGENT_ALLOW_IMAGE_EGRESS,
    deps.config.VERA_AGENT_LLM_ENABLED,
    deps.log,
  );
  const policy = new PolicyEngine();
  const translation = new TranslationService();
  const orchestrator = new Orchestrator({ config: deps.config });
  const veriAgent = new VeriAgent({
    policy,
    privacy,
    translation,
    orchestrator,
    audit,
  });
  const observability = createObservability(deps.config);

  const securityConfig = loadSecurityConfig(deps.config);
  const rateLimiter = new RateLimiter(
    securityConfig,
    createRateLimitStore(deps.redis),
  );
  const abuseDetector = new AbuseDetector(securityConfig);
  const security: SecurityServices = {
    rateLimiter,
    abuseDetector,
    audit,
    imageEgressDisabled: !deps.config.VERA_AGENT_ALLOW_IMAGE_EGRESS,
  };

  return {
    config: deps.config,
    log: deps.log,
    audit,
    privacy,
    policy,
    translation,
    orchestrator,
    veriAgent,
    security,
    observability,
    db: deps.db,
    redis: deps.redis,
    ready: async () => {
      let database = true;
      let redis = !deps.config.REDIS_ENABLED;
      if (deps.db) {
        try {
          await deps.db.query("SELECT 1");
          database = true;
        } catch {
          database = false;
        }
      } else {
        database = deps.config.NODE_ENV === "test";
      }
      if (deps.config.REDIS_ENABLED && deps.redis) {
        try {
          const pong = await deps.redis.ping();
          redis = pong === "PONG";
        } catch {
          redis = false;
        }
      }
      return { database, redis };
    },
  };
}
