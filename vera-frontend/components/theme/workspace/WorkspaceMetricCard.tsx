import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "amber" | "red" | "teal";
  className?: string;
};

const TONE_SURFACE: Record<NonNullable<Props["tone"]>, string> = {
  default: "border-[#2A2E33]/10 bg-white",
  amber: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-white",
  red: "border-red-200/80 bg-gradient-to-br from-red-50 to-white",
  teal: "border-[#2F8F8C]/25 bg-gradient-to-br from-[#E4F3F2] to-white",
};

const TONE_VALUE: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-[#2A2E33]",
  amber: "text-amber-950",
  red: "text-red-950",
  teal: "text-[#247A78]",
};

export function WorkspaceMetricCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: Props) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ring-[#2A2E33]/5",
        TONE_SURFACE[tone],
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6b7c]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
          TONE_VALUE[tone],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-sm leading-relaxed text-[#5a6b7c]">{hint}</p>
      ) : null}
    </article>
  );
}
