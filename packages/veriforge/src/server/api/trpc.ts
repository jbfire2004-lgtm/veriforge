/**
 * tRPC context contract. Nest (`backend/src/server/api`) and SaaS Express
 * both satisfy this shape when bridging to domain services.
 */

import type { AuthPrincipal } from "../../types/auth";

export interface TrpcContext {
  accessToken: string | null;
  principal: AuthPrincipal | null;
}

export function createContext(headers: { authorization?: string }): TrpcContext {
  const header = headers.authorization;
  const accessToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
  return { accessToken, principal: null };
}

export function procedure<I, O>(fn: (input: I, ctx: TrpcContext) => Promise<O> | O) {
  return { handler: fn };
}
