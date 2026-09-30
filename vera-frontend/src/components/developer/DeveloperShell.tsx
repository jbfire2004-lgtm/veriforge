"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ContentContainer,
  PageLayout,
} from "@/src/components/navigation";
import {
  clearDeveloperSession,
  getDeveloperSession,
} from "@/lib/developer-api";

export function DeveloperShell({
  title,
  description,
  children,
  requireAuth = true,
}: {
  title: string;
  description?: string;
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
    if (!getDeveloperSession()) {
      router.replace("/developer/login");
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
          requireAuth ? (
            <button
              type="button"
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
              onClick={() => {
                clearDeveloperSession();
                router.push("/developer/login");
              }}
            >
              Sign out
            </button>
          ) : null
        }
      >
        {children}
      </PageLayout>
    </ContentContainer>
  );
}
