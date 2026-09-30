"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ContentContainer,
  PageLayout,
} from "@/src/components/navigation";
import {
  clearHiringClientSession,
  getHiringClientSession,
} from "@/lib/hiring-client-api";

export function HiringClientShell({
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
    if (!getHiringClientSession()) {
      router.replace("/client/login");
      return;
    }
    setReady(true);
  }, [requireAuth, router]);

  if (!ready) {
    return (
      <ContentContainer>
        <PageLayout title={title}>
          <p className="text-sm text-zinc-500">Loading…</p>
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
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
                onClick={() => {
                  clearHiringClientSession();
                  router.push("/client/login");
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
