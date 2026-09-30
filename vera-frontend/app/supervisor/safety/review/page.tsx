import Link from "next/link";
import { requireRouteAccess } from "@/lib/route-access";
import { canAccessSupervisorShell } from "@/lib/phase1-roles";
import { SafetyFormReviewQueue } from "@/components/safety-workflow/SafetyFormReviewQueue";
import { Breadcrumbs, buttonStyles } from "@/components/ui";
import { WorkspaceHero } from "@/components/theme/workspace";

export default async function SupervisorSafetyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  await requireRouteAccess({
    callbackUrl: "/supervisor/safety/review",
    guard: canAccessSupervisorShell,
  });

  const sp = await searchParams;
  const projectId = sp.projectId ? Number(sp.projectId) : undefined;
  const companyId = sp.companyId ? Number(sp.companyId) : undefined;

  return (
    <div className="space-y-vera-6">
      <Breadcrumbs
        items={[
          { label: "Supervisor", href: "/supervisor" },
          { label: "Safety review", href: "#" },
        ]}
      />
      <WorkspaceHero
        title="Safety form review"
        description="Approve or reject submitted JHA, FLHA, SIF, HECA, Energy Wheel, and inspection forms."
        actions={
          <Link href="/supervisor" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Supervisor home
          </Link>
        }
      />
      <SafetyFormReviewQueue projectId={projectId} companyId={companyId} />
    </div>
  );
}
