import React from "react";
import { canAccessAdminShell } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { VeraAppShell } from "@/src/components/layout/VeraAppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRouteAccess({
    callbackUrl: "/admin",
    guard: canAccessAdminShell,
  });

  return (
    <VeraAppShell
      variant="admin"
      role={role}
      userName={session.user?.name ?? null}
      userEmail={session.user?.email ?? null}
    >
      {children}
    </VeraAppShell>
  );
}
