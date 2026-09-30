import Link from "next/link";
import { redirect } from "next/navigation";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { requireRouteAccess } from "@/lib/route-access";
import { canAccessProviderPortal } from "@/lib/training-provider-permissions";
import { Breadcrumbs, ErrorState, buttonStyles } from "@/components/ui";
import { ProviderPortalDashboardClient } from "./ProviderPortalDashboardClient";

export default async function ProviderPortalDashboardPage() {
  const { session } = await requireRouteAccess({
    callbackUrl: "/provider-portal",
    guard: canAccessProviderPortal,
  });
  const res = await apiGetSafeProviderDashboard(session);

  if (!res.ok) {
    const sessionExpired =
      res.error.includes("session has expired") ||
      res.error.includes("missing an API token");
    if (sessionExpired) {
      redirect(
        `/auth/login?callbackUrl=${encodeURIComponent("/provider-portal")}&error=session_expired`,
      );
    }

    const needsRegistration =
      res.error.includes("not linked") ||
      res.error.includes("No training provider");
    return (
      <PageWrap>
        <ErrorState title="Provider dashboard unavailable" description={res.error}>
          {needsRegistration ? (
            <Link
              href="/provider-portal/register"
              className={buttonStyles({ variant: "teal", size: "sm", className: "mt-4 inline-flex" })}
            >
              Register a training provider
            </Link>
          ) : null}
        </ErrorState>
      </PageWrap>
    );
  }

  const { provider, stats, compliance, recentRecords } = res.data;

  return (
    <PageWrap>
      <Breadcrumbs
        items={[
          { label: "VERA", href: "/" },
          { label: "Training provider", href: "/provider-portal" },
          { label: "Dashboard" },
        ]}
        className="mb-4 text-[var(--muted-foreground)]"
      />
      <ProviderPortalDashboardClient
        data={{
          provider,
          stats,
          compliance: compliance
            ? {
                rate: compliance.score ?? undefined,
                issues: compliance.status === "ATTENTION" ? 1 : 0,
              }
            : undefined,
          recentRecords: (
            recentRecords as Array<{
              id: number;
              worker?: { firstName?: string; lastName?: string };
              certification?: { name?: string };
              issuedAt?: string;
              status?: string;
            }>
          ).map((r) => ({
            id: r.id,
            workerName: [r.worker?.firstName, r.worker?.lastName].filter(Boolean).join(" "),
            courseName: r.certification?.name,
            issuedAt: r.issuedAt,
            status: r.status,
          })),
        }}
      />
    </PageWrap>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="space-y-vera-6 p-vera-6">{children}</div>;
}
