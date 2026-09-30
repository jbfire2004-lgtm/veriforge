"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import { SfButton } from "@/src/components/safety-forms/ui";

type VeraAuthGateProps = {
  children: ReactNode;
  /** When true, blocks children until bearer token is available (default). */
  requireToken?: boolean;
};

/**
 * Ensures PM (and other protected client surfaces) do not fire API calls or
 * render protected UI until NextAuth session + access token are ready.
 */
export function VeraAuthGate({
  children,
  requireToken = true,
}: VeraAuthGateProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    sessionRefreshing,
  } = useVeraAuthOrHook();

  const qs = searchParams?.toString();
  const callbackUrl = `${pathname ?? "/pm"}${qs ? `?${qs}` : ""}`;
  const loginHref = `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (requireToken && tokenReady) {
    return children;
  }

  // Signed into NextAuth UI but bearer token never arrived (API was down, refresh wiped).
  if (requireToken && (sessionExpired || (!authLoading && authenticated && !tokenReady && !sessionRefreshing))) {
    return (
      <div className="space-y-3 text-sm text-amber-800" role="alert">
        <p>Session expired. Sign out and sign in again to continue.</p>
        <div className="flex flex-wrap gap-2">
          <SfButton
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void signOut({ callbackUrl: loginHref })}
          >
            Sign out
          </SfButton>
          <Link href={loginHref} className="font-medium text-[var(--sf-primary)] underline">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!authenticated && !authLoading) {
    return (
      <div className="space-y-3 text-sm text-[var(--sf-text-muted)]" role="alert">
        <p>Sign in to open Vera PM.</p>
        <Link href={loginHref} className="font-medium text-[var(--sf-primary)] underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (requireToken && !tokenReady) {
    return (
      <p className="text-sm text-[var(--sf-text-muted)]" role="status">
        Preparing secure session…
      </p>
    );
  }

  return children;
}
