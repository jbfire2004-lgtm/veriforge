/**
 * Auth principals. Three isolated JWT namespaces — never mix tokens.
 */

export type AuthNamespace = "organization" | "hiring_client" | "developer";

export interface OrgJwtPayload {
  ns: "organization";
  user_id: string;
  org_id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface HiringClientJwtPayload {
  ns: "hiring_client";
  user_id: string;
  hiring_client_id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface DeveloperJwtPayload {
  ns: "developer";
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
}

export type AuthPrincipal =
  | OrgJwtPayload
  | HiringClientJwtPayload
  | DeveloperJwtPayload;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
