"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PermitList, PermitsTabBar, PermitTypeCatalog } from "@/components/permits";
import { usePmPermits, type PermitsTab } from "@/hooks/usePmPermits";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { PmPageShell, PmSurfaceCard } from "@/src/components/pm/layout";
import { SfButton } from "@/src/components/safety-forms/ui";

const EMPTY: Record<PermitsTab, string> = {
  active: "No active permits for this project.",
  pending: "No permits awaiting approval.",
  expired: "No expired permits.",
  templates: "Permit templates load from Vera Core.",
  history: "No closed or historical permits yet.",
};

export default function PmPermitsPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as PermitsTab | null;
  const tab: PermitsTab =
    tabParam && ["active", "pending", "expired", "templates", "history"].includes(tabParam)
      ? tabParam
      : "active";

  const {
    query,
    permits,
    types,
    error,
    ready,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    reload,
  } = usePmPermits(companyId, projectId, tab);

  const setTab = (next: PermitsTab) => {
    router.push(`/pm/permits?tab=${next}&projectId=${projectId}&companyId=${companyId}`);
  };

  const displayTypes = useMemo(() => types, [types]);

  return (
    <PmPageShell
      title="Work permits"
      description="Authorize high-risk work — confined space, hot work, LOTO, excavation, fall protection, live line, and open hole."
      actions={
        <Link href={`/pm/permits/new${query}`}>
          <SfButton type="button">
            <ShieldCheck className="mr-2 h-4 w-4" />
            New permit
          </SfButton>
        </Link>
      }
      filters={<PermitsTabBar active={tab} onChange={setTab} />}
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load permits.",
      }}
    >
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!ready ? (
        <PmSurfaceCard>
          <p className="text-sm text-[var(--muted-foreground)]">Loading permits…</p>
        </PmSurfaceCard>
      ) : tab === "templates" ? (
        <PermitTypeCatalog types={displayTypes} query={query} />
      ) : (
        <PmSurfaceCard title={`${tab.replace(/_/g, " ")} permits`}>
          <PermitList
            permits={permits}
            query={query}
            emptyMessage={EMPTY[tab]}
            onRefresh={() => void reload()}
          />
        </PmSurfaceCard>
      )}
    </PmPageShell>
  );
}
