import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, ErrorState } from "@/components/ui";

export default async function ValidationResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await apiGetSafe<{
    id: number;
    subjectType: string;
    outcome: string;
    score: number | null;
    jurisdictionCode: string | null;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    validatedAt: string;
    rejections?: { message: string | null; rejectionReason: { code: string; title: string } }[];
  }>(`/api/v1/training-standards/results/${id}`);

  return (
    <AdminPageShell
      title={`Validation #${id}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Training standards", href: "/admin/training-standards" },
        { label: "Results", href: "/admin/training-standards/results" },
        { label: `#${id}` },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Result not found" description={res.error} />
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4 text-sm">
            <p>
              <strong>{res.data.subjectType}</strong> · {res.data.outcome} · Score{" "}
              {res.data.score ?? "—"}%
            </p>
            <p className="text-muted-foreground">
              Jurisdiction: {res.data.jurisdictionCode} ·{" "}
              {new Date(res.data.validatedAt).toLocaleString()}
            </p>
            <div>
              <h3 className="font-medium mb-1">Matched standards</h3>
              <p>{res.data.matchedStandardCodes.join(", ") || "—"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Missing standards</h3>
              <p className="text-amber-800">
                {res.data.missingStandardCodes.join(", ") || "—"}
              </p>
            </div>
            {res.data.rejections && res.data.rejections.length > 0 && (
              <ul className="list-disc pl-5">
                {res.data.rejections.map((r, i) => (
                  <li key={i}>
                    {r.rejectionReason.code}: {r.rejectionReason.title}
                    {r.message ? ` — ${r.message}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}
