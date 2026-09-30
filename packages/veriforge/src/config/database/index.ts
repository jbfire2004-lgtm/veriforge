/**
 * Database connection contract.
 * Canonical Prisma client: services/veriforge-saas-service.
 */

export interface DatabaseConfig {
  url: string;
  poolMax: number;
  ssl: boolean;
}

export function databaseConfig(url: string, nodeEnv: string): DatabaseConfig {
  return {
    url,
    poolMax: nodeEnv === "production" ? 20 : 5,
    ssl: nodeEnv === "production",
  };
}
