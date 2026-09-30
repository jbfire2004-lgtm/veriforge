import { cn } from "@/src/lib/utils";

const tones = {
  neutral: "bg-zinc-200 text-zinc-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-800",
  info: "bg-sky-100 text-sky-800",
} as const;

export type StatusTone = keyof typeof tones;

export function StatusIndicator({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium capitalize",
        tones[tone],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "success" && "bg-emerald-600",
          tone === "warning" && "bg-amber-600",
          tone === "danger" && "bg-red-600",
          tone === "info" && "bg-sky-600",
          tone === "neutral" && "bg-zinc-500",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function statusToneFromCompliance(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === "valid" || s === "active" || s === "approved") return "success";
  if (s === "pending_review" || s === "expiring" || s === "trialing") return "warning";
  if (s === "expired" || s === "rejected" || s === "canceled") return "danger";
  return "neutral";
}
