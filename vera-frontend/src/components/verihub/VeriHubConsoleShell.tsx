"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ContentContainer,
  PageLayout,
} from "@/src/components/navigation";
import {
  clearVeriHubSession,
  getVeriHubSession,
} from "@/lib/verihub-org-api";

export function VeriHubConsoleShell({
  title,
  description,
  actions,
  children,
  requireAuth = true,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(!requireAuth);

  useEffect(() => {
    if (!requireAuth) {
      setReady(true);
      return;
    }
    const session = getVeriHubSession();
    if (!session) {
      router.replace("/verihub/signup");
      return;
    }
    setReady(true);
  }, [requireAuth, router]);

  if (!ready) {
    return (
      <ContentContainer>
        <PageLayout title={title}>
          <p className="text-sm text-zinc-500">Loading organization console…</p>
        </PageLayout>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageLayout
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {requireAuth ? (
              <button
                type="button"
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => {
                  clearVeriHubSession();
                  router.push("/verihub/signup");
                }}
              >
                Sign out
              </button>
            ) : null}
          </div>
        }
      >
        {children}
      </PageLayout>
    </ContentContainer>
  );
}
