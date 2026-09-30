"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useVeraAuth } from "@/hooks/useVeraAuth";

export type VeraAuthState = ReturnType<typeof useVeraAuth>;

const VeraAuthContext = createContext<VeraAuthState | null>(null);

type VeraAuthProviderProps = {
  children: ReactNode;
  /** Server-resolved API bearer token for faster PM/Core client bootstrap. */
  initialAccessToken?: string | null;
};

/** Shares NextAuth session + token-ready state across Vera PM (and Core client trees). */
export function VeraAuthProvider({
  children,
  initialAccessToken,
}: VeraAuthProviderProps) {
  const auth = useVeraAuth({ initialAccessToken });
  return (
    <VeraAuthContext.Provider value={auth}>{children}</VeraAuthContext.Provider>
  );
}

export function useVeraAuthContext(): VeraAuthState {
  const ctx = useContext(VeraAuthContext);
  if (!ctx) {
    throw new Error("useVeraAuthContext must be used within VeraAuthProvider");
  }
  return ctx;
}

/** Prefer context when inside PM; fall back to hook elsewhere. */
export function useVeraAuthOrHook(): VeraAuthState {
  const ctx = useContext(VeraAuthContext);
  const auth = useVeraAuth();
  return ctx ?? auth;
}
