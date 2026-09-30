import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { apiGetSafeProviderDashboard } from "@/lib/api/training-provider.server";
import { Breadcrumbs, Card, CardContent, buttonStyles } from "@/components/ui";

export default async function InstructorDashboardPage() {
  const [dash, profile] = await Promise.all([
    apiGetSafeProviderDashboard(),
    apiGetSafe<{ firstName: string; lastName: string; qualificationStatus: string; courses: { name: string }[] }>(
      "/api/v1/training-providers/instructor/me"
    ),
  ]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Provider portal", href: "/provider-portal/instructor" },
          { label: "Instructor dashboard" },
        ]}
        className="mb-4"
      />
      <h1 className="text-2xl font-semibold mb-2">Instructor dashboard</h1>
      {profile.ok && (
        <p className="text-muted-foreground mb-6">
          {profile.data.firstName} {profile.data.lastName} · {profile.data.qualificationStatus}
        </p>
      )}

      {dash.ok && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{dash.data.provider.name}</p>
              <p className="text-xs text-muted-foreground">{dash.data.provider.approvalStatus}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Records issued (provider)</p>
              <p className="text-2xl font-semibold">{dash.data.stats.trainingRecordsIssued}</p>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="flex flex-wrap gap-3">
        <Link href="/provider-portal/upload" className={buttonStyles({ variant: "teal" })}>
          Deliver training
        </Link>
        <Link href="/provider-portal/class-lists" className={buttonStyles({ variant: "outline" })}>
          Upload class list
        </Link>
        <Link href="/provider-portal/certificates" className={buttonStyles({ variant: "outline" })}>
          Issue certificate
        </Link>
        <Link href="/provider-portal/sign" className={buttonStyles({ variant: "outline" })}>
          Sign certificate
        </Link>
      </section>
    </div>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
