import "dotenv/config";
import { loadConfig } from "./config";
import { createLogger } from "./logging";
import { createContainer } from "./core/container";
import { connectPostgres, connectRedis } from "./core/infra";
import { buildApp } from "./api";

async function main(): Promise<void> {
  const config = loadConfig();
  const log = createLogger(config);

  const db = await connectPostgres(config, log);
  const redis = await connectRedis(config, log);
  const container = createContainer({ config, log, db, redis });

  const app = await buildApp(container);
  await app.listen({ port: config.PORT, host: config.HOST });
  log.info(
    { port: config.PORT, region: config.VERA_AGENT_REGION },
    "veri-agent-service listening",
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
