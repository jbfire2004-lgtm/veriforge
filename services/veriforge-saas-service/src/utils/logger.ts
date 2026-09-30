import winston from 'winston';
import { env } from '../config/env';
import { getCorrelationId } from '../observability/context';

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    const correlationId = getCorrelationId();
    if (correlationId) info.correlationId = correlationId;
    return info;
  })(),
  winston.format.json(),
);

/**
 * Structured JSON logger.
 * Levels: debug | info | warn | error (via LOG_LEVEL).
 * Automatically injects correlationId from AsyncLocalStorage when present.
 */
export const logger = winston.createLogger({
  level: env.logLevel,
  levels: winston.config.npm.levels,
  format: baseFormat,
  defaultMeta: {
    service: process.env.OTEL_SERVICE_NAME ?? 'veriforge-saas-service',
    env: env.nodeEnv,
  },
  transports: [new winston.transports.Console()],
});
