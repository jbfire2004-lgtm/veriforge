import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Card, CardContent, ErrorState } from "@/components/ui";

export default async function ValidationResultsPage() {
  const res = await apiGetSafe<unknown[]>("/api/v1/training-standards/results?limit=100");

  return (
    <AdminPageShell
      title="Validation results"
      description="Training record, provider, instructor, and certificate validation outcomes."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training standards", href: "/admin/training-standards" },
        { label: "Results" },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Could not load results" description={res.error} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y text-sm">
              {(
                res.data as {
                  id: number;
                  subjectType: string;
                  outcome: string;
                  score: number | null;
                  jurisdictionCode: string | null;
                  validatedAt: string;
                  rejections?: { rejectionReason: { code: string; title: string } }[];
                }[]
              ).map((r) => (
                <li key={r.id} className="py-4 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/admin/training-standards/results/${r.id}`}
                      className="font-medium hover:underline"
                    >
                      #{r.id} · {r.subjectType}
                    </Link>
                    <OutcomeBadge outcome={r.outcome} />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {r.jurisdictionCode ?? "—"} · Score {r.score ?? "—"}% ·{" "}
                    {new Date(r.validatedAt).toLocaleString()}
                  </p>
                  {r.rejections && r.rejections.length > 0 && (
                    <ul className="mt-2 text-xs text-amber-800">
                      {r.rejections.map((rej, i) => (
                        <li key={i}>
                          {rej.rejectionReason.code}: {rej.rejectionReason.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const variant =
    outcome === "APPROVED"
      ? "success"
      : outcome === "REJECTED"
        ? "destructive"
        : "warning";
  return <Badge variant={variant as "success"}>{outcome}</Badge>;
}
