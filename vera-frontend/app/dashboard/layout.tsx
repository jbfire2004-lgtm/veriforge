import { redirect } from "next/navigation";
import { Phase1Role } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { VeraAppShell } from "@/src/components/layout/VeraAppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, role } = await requireRouteAccess({ callbackUrl: "/dashboard" });
  if (role === Phase1Role.SUPERVISOR) {
    redirect("/supervisor");
  }

  return (
    <VeraAppShell
      variant="workspace"
      role={role}
      userName={session.user?.name ?? null}
      userEmail={session.user?.email ?? null}
    >
      {children}
    </VeraAppShell>
  );
}
