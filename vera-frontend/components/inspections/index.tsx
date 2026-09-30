"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type InspectionAuthStatusProps = {
  authLoading: boolean;
  authenticated: boolean;
  tokenReady: boolean;
  sessionExpired: boolean;
  /** Shown when unauthenticated (rare inside VeraAuthGate). */
  signInMessage?: string;
};

/** Consistent session hydration UI — avoids false "sign in" while token loads. */
export function InspectionAuthStatus({
  authLoading,
  authenticated,
  tokenReady,
  sessionExpired,
  signInMessage = "Sign in to load inspections.",
}: InspectionAuthStatusProps) {
  if (authLoading) {
    return (
      <p className="text-sm text-[var(--sf-text-muted)]" role="status">
        Checking sign-in…
      </p>
    );
  }

  if (authenticated && !tokenReady && !sessionExpired) {
    return (
      <p className="text-sm text-[var(--sf-text-muted)]" role="status">
        Preparing secure session…
      </p>
    );
  }

  if (sessionExpired) {
    return (
      <div role="alert">
        <SfCard className="space-y-3 p-4 text-sm text-amber-800">
          <p>Session expired. Sign out and sign in again to continue.</p>
          <div className="flex flex-wrap gap-2">
            <SfButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => void signOut({ callbackUrl: "/auth/login" })}
            >
              Sign out
            </SfButton>
            <Link href="/auth/login" className="text-sm font-medium text-[var(--sf-primary)] underline">
              Go to sign in
            </Link>
          </div>
        </SfCard>
      </div>
    );
  }

  // PM layout may bootstrap a bearer token before client useSession says
  // "authenticated" — don't flash a false sign-in wall in that case.
  if (!authenticated && !tokenReady) {
    return (
      <div role="alert">
        <SfCard className="p-4 text-sm text-amber-800">{signInMessage}</SfCard>
      </div>
    );
  }

  return null;
}

type InspectionTemplatesEmptyProps = {
  title: string;
  description: string;
  manageHref?: string;
  onRetry?: () => void;
  children?: ReactNode;
};

export function InspectionTemplatesEmpty({
  title,
  description,
  manageHref,
  onRetry,
  children,
}: InspectionTemplatesEmptyProps) {
  return (
    <SfCard className="space-y-3 p-5 text-sm text-[var(--sf-text-muted)]">
      <p className="font-medium text-[#2A2E33]">{title}</p>
      <p>{description}</p>
      {children}
      <div className="flex flex-wrap gap-2 pt-1">
        {onRetry ? (
          <SfButton type="button" size="sm" variant="secondary" onClick={onRetry}>
            Reload library
          </SfButton>
        ) : null}
        {manageHref ? (
          <Link href={manageHref} className="text-sm font-medium text-[var(--sf-primary)] underline">
            Manage templates
          </Link>
        ) : null}
      </div>
    </SfCard>
  );
}

export { TemplatePickerCard } from "./TemplatePickerCard";
export { SmartInspectionCategoryGrid } from "./SmartInspectionCategoryGrid";
export {
  InspectionLaunchGrid,
  type InspectionLaunchLinks,
} from "./InspectionLaunchGrid";
export { InspectionChecklistFields } from "@/components/inspection/InspectionChecklistFields";
export { SmartSitePhotoPanel } from "@/components/inspection/SmartSitePhotoPanel";
export { SmartInspectionSetupCard } from "@/components/inspection/SmartInspectionSetupCard";
