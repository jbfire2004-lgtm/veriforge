import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

/**
 * Connection pooling via Prisma's built-in pool (connection_limit on DATABASE_URL).
 * Recommended production URL params:
 *   ?connection_limit=15&pool_timeout=20&connect_timeout=10
 * Behind PgBouncer (transaction mode):
 *   ?pgbouncer=true&connection_limit=1
 */
function buildDatasourceUrl(): string {
  try {
    const url = new URL(env.databaseUrl);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set(
        'connection_limit',
        String(process.env.DB_POOL_SIZE ?? (env.isProduction ? 15 : 5)),
      );
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', String(process.env.DB_POOL_TIMEOUT ?? 20));
    }
    return url.toString();
  } catch {
    const sep = env.databaseUrl.includes('?') ? '&' : '?';
    const limit = process.env.DB_POOL_SIZE ?? (env.isProduction ? 15 : 5);
    return `${env.databaseUrl}${sep}connection_limit=${limit}&pool_timeout=${process.env.DB_POOL_TIMEOUT ?? 20}`;
  }
}

export const prisma = new PrismaClient({
  datasources: {
    db: { url: buildDatasourceUrl() },
  },
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});
