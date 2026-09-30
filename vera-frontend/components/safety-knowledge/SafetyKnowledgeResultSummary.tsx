import type { SafetyKnowledgeResult } from "@/lib/safety-knowledge";

export function formatSafetyKnowledgeEvaluatedAt(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

export function safetyKnowledgeStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();
  if (normalized.includes("proficient") || normalized.includes("pass")) {
    return "success";
  }
  if (normalized.includes("developing") || normalized.includes("review")) {
    return "warning";
  }
  if (normalized.includes("deficient") || normalized.includes("fail")) {
    return "danger";
  }
  return "neutral";
}

const STATUS_STYLES: Record<
  ReturnType<typeof safetyKnowledgeStatusTone>,
  string
> = {
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
  neutral: "bg-slate-100 text-slate-800",
};

export function SafetyKnowledgeStatusBadge({ status }: { status: string }) {
  const tone = safetyKnowledgeStatusTone(status);
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tone]}`}
    >
      {status}
    </span>
  );
}

export function SafetyKnowledgeResultSummary({
  result,
  evaluatedAt,
  compact = false,
}: {
  result: SafetyKnowledgeResult;
  evaluatedAt?: string | null;
  compact?: boolean;
}) {
  const when = formatSafetyKnowledgeEvaluatedAt(evaluatedAt);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SafetyKnowledgeStatusBadge status={result.overallStatus} />
        <span className="text-sm font-medium">{result.overallScore}/100</span>
        {when ? (
          <span className="text-xs text-[var(--sf-text-muted)]">
            Evaluated {when}
          </span>
        ) : null}
      </div>

      <ul className={`space-y-2 text-sm ${compact ? "text-xs" : ""}`}>
        {result.domains.map((domain) => (
          <li
            key={domain.domain}
            className="rounded border border-[var(--sf-border)] px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{domain.domain}</span>
              <SafetyKnowledgeStatusBadge status={domain.status} />
              <span className="text-[var(--sf-text-muted)]">{domain.score}</span>
            </div>
            {!compact && domain.gaps[0] ? (
              <p className="mt-1 text-[var(--sf-text-muted)]">{domain.gaps[0]}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {!compact && result.recommendations.length ? (
        <div>
          <h3 className="text-sm font-medium">Recommendations</h3>
          <ul className="mt-1 list-disc pl-5 text-sm text-[var(--sf-text-muted)]">
            {result.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {compact && result.recommendations[0] ? (
        <p className="text-xs text-[var(--sf-text-muted)]">
          Top recommendation: {result.recommendations[0]}
        </p>
      ) : null}
    </div>
  );
}

export async function triggerSafetyKnowledgePdfDownload(
  workerId: number,
  downloadPdf: (id: number) => Promise<Blob>,
) {
  const blob = await downloadPdf(workerId);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `safety-knowledge-${workerId}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
