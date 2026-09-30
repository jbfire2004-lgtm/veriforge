/**
 * Environment config. Runtime SoR service reads process.env in
 * services/veriforge-saas-service; this module is the typed contract.
 */

export interface VeriforgeEnv {
  nodeEnv: "development" | "test" | "production";
  saasUrl: string;
  databaseUrl: string;
  jwtSecretOrg: string;
  jwtSecretHiringClient: string;
  jwtSecretDeveloper: string;
}

export function readEnv(source: Record<string, string | undefined> = {}): VeriforgeEnv {
  const nodeEnv =
    source.NODE_ENV === "production" || source.NODE_ENV === "test"
      ? source.NODE_ENV
      : "development";

  return {
    nodeEnv,
    saasUrl: (source.VERIFORGE_SAAS_URL ?? "http://127.0.0.1:3020").replace(/\/$/, ""),
    databaseUrl: source.DATABASE_URL ?? "",
    jwtSecretOrg: source.JWT_SECRET ?? source.VERIFORGE_JWT_SECRET ?? "",
    jwtSecretHiringClient:
      source.HIRING_CLIENT_JWT_SECRET ?? source.JWT_SECRET ?? "",
    jwtSecretDeveloper: source.DEVELOPER_JWT_SECRET ?? source.JWT_SECRET ?? "",
  };
}
