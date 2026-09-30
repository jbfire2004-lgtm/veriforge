"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { VeraAuthGate } from "@/components/auth/VeraAuthGate";
import { VeraAuthProvider } from "@/contexts/VeraAuthContext";
import { VeraModuleBoundary } from "@/components/vera-access/VeraModuleBoundary";
import { isVeraPmDevOpen } from "@/lib/pm-dev-open";
import { SfButton } from "@/src/components/safety-forms/ui";

type Props = {
  children: ReactNode;
  /** Server-resolved bearer token — PM layout already authenticated the user. */
  initialAccessToken?: string | null;
  /** Layout passed server route guard — skip redundant client session wall. */
  serverSessionVerified?: boolean;
};

function MissingBearerPrompt() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams?.toString();
  const callbackUrl = `${pathname ?? "/pm"}${qs ? `?${qs}` : ""}`;
  const loginHref = `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm text-amber-900" role="alert">
      <p className="font-semibold">Your API session expired</p>
      <p className="text-amber-800/90">
        You&apos;re still signed into the app shell, but the bearer token Inspections
        needs is missing (often after the API was restarted). Sign in again to
        reload templates and start inspections.
      </p>
      <div className="flex flex-wrap gap-2">
        <SfButton
          type="button"
          size="sm"
          onClick={() => void signOut({ callbackUrl: loginHref })}
        >
          Sign out &amp; sign in
        </SfButton>
        <Link href={loginHref} className="font-medium text-[var(--sf-primary)] underline">
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

export function PmAccessWrapper({
  children,
  initialAccessToken,
  serverSessionVerified = false,
}: Props) {
  const content = (
    <VeraModuleBoundary moduleId="pm" moduleName="Vera PM" optimistic>
      {children}
    </VeraModuleBoundary>
  );

  const hasBearer =
    typeof initialAccessToken === "string" && initialAccessToken.length > 0;
  const devOpen = isVeraPmDevOpen();

  return (
    <VeraAuthProvider initialAccessToken={initialAccessToken}>
      {devOpen || (serverSessionVerified && hasBearer) ? (
        content
      ) : serverSessionVerified && !hasBearer ? (
        <MissingBearerPrompt />
      ) : (
        <VeraAuthGate requireToken={!devOpen}>{content}</VeraAuthGate>
      )}
    </VeraAuthProvider>
  );
}
