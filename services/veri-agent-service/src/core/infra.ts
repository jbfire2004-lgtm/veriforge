import { Pool } from "pg";
import Redis from "ioredis";
import type { AppConfig } from "../config";
import type { Logger } from "pino";

export async function connectPostgres(
  config: AppConfig,
  log: Logger,
): Promise<Pool | null> {
  if (config.NODE_ENV === "test") return null;
  try {
    const pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
    });
    await pool.query("SELECT 1");
    log.info("postgres connected");
    return pool;
  } catch (err) {
    log.warn(
      { err: err instanceof Error ? err.message : String(err) },
      "postgres unavailable — starting without DB (metadata persistence disabled)",
    );
    if (config.isProd) throw err;
    return null;
  }
}

export async function connectRedis(
  config: AppConfig,
  log: Logger,
): Promise<Redis | null> {
  if (!config.REDIS_ENABLED || config.NODE_ENV === "test") return null;
  try {
    const redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await redis.connect();
    await redis.ping();
    log.info("redis connected");
    return redis;
  } catch (err) {
    log.warn(
      { err: err instanceof Error ? err.message : String(err) },
      "redis unavailable — rate limit memory fallback",
    );
    return null;
  }
}
