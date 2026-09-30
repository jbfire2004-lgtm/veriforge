"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { isVeraPmDevOpen } from "@/lib/pm-dev-open";
import { setVeraAuthBootstrapping, setVeraBootstrapAccessToken } from "@/lib/vera-auth-boot";

type UseVeraAuthOptions = {
  /** Server-resolved bearer token — avoids waiting on client session hydration. */
  initialAccessToken?: string | null;
};

const REFRESH_TIMEOUT_MS = 8_000;

/**
 * Shared client auth state for Vera Core and Vera PM.
 * Waits for NextAuth hydration and triggers session refresh when the user
 * is signed in but the bearer token is not yet on the session object.
 */
export function useVeraAuth(options: UseVeraAuthOptions = {}) {
  const { initialAccessToken } = options;
  const { data: session, status, update } = useSession();
  const [refreshSettled, setRefreshSettled] = useState(false);
  const refreshStarted = useRef(false);

  const bootstrapRef = useRef<string | undefined>(
    typeof initialAccessToken === "string" && initialAccessToken.length > 0
      ? initialAccessToken
      : undefined,
  );
  if (
    typeof initialAccessToken === "string" &&
    initialAccessToken.length > 0
  ) {
    bootstrapRef.current = initialAccessToken;
  }

  const authLoading = status === "loading" && !isVeraPmDevOpen();
  const authenticated = status === "authenticated" || isVeraPmDevOpen();
  const unauthenticated = status === "unauthenticated" && !isVeraPmDevOpen();

  const sessionToken =
    typeof session?.accessToken === "string" && session.accessToken.length > 0
      ? session.accessToken
      : undefined;
  const bootstrapToken = bootstrapRef.current;
  const effectiveToken =
    sessionToken ?? bootstrapToken ?? (isVeraPmDevOpen() ? "dev-open" : undefined);
  const tokenReady = !!effectiveToken;

  useEffect(() => {
    setVeraAuthBootstrapping(!tokenReady && !unauthenticated);
    // Only publish when we have a token — a secondary useVeraAuth() without
    // initialAccessToken must not wipe the provider's bootstrap token.
    if (effectiveToken) {
      setVeraBootstrapAccessToken(effectiveToken);
    }
  }, [effectiveToken, tokenReady, unauthenticated]);

  useEffect(() => {
    return () => {
      setVeraAuthBootstrapping(false);
    };
  }, []);

  useEffect(() => {
    if (bootstrapToken || tokenReady) {
      refreshStarted.current = false;
      if (tokenReady) setRefreshSettled(false);
      return;
    }

    if (authLoading || !authenticated) {
      return;
    }

    if (refreshStarted.current) {
      return;
    }
    refreshStarted.current = true;
    setRefreshSettled(false);

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setRefreshSettled(true);
    }, REFRESH_TIMEOUT_MS);

    void (async () => {
      const { getSession } = await import("next-auth/react");
      const retryDelaysMs = [0, 80, 160, 320, 640];

      for (const delayMs of retryDelaysMs) {
        if (cancelled) return;
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
        const current = await getSession();
        if (current?.accessToken) return;
      }

      if (cancelled) return;
      await update();
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;

      const afterUpdate = await getSession();
      if (!afterUpdate?.accessToken && !cancelled) {
        setRefreshSettled(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      refreshStarted.current = false;
    };
  }, [authLoading, authenticated, bootstrapToken, tokenReady, update]);

  const sessionExpired = authenticated && !tokenReady && refreshSettled;
  const sessionRefreshing = authenticated && !tokenReady && !refreshSettled;

  return {
    session,
    authLoading,
    authenticated,
    tokenReady,
    accessToken: effectiveToken,
    sessionExpired,
    sessionRefreshing,
  };
}
