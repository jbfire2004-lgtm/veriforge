/**
 * Security defaults for the three auth namespaces.
 */

export const AUTH_NAMESPACES = {
  organization: {
    issuer: "veriforge-app",
    audience: "veriforge-org",
  },
  hiring_client: {
    issuer: "veriforge-hiring-client",
    audience: "veriforge-client",
  },
  developer: {
    issuer: "veriforge-developer",
    audience: "veriforge-developer",
  },
} as const;

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "30d";

export const PASSWORD_POLICY = {
  minLength: 12,
  requireLower: true,
  requireUpper: true,
  requireDigit: true,
  requireSymbol: true,
} as const;
