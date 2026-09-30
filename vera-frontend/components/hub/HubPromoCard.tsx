import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Props = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentBar: string;
  iconGradient: string;
  surface: string;
  ring?: string;
};

export function HubPromoCard({
  href,
  eyebrow,
  title,
  description,
  icon: Icon,
  accentBar,
  iconGradient,
  surface,
  ring = "ring-[#2A2E33]/10",
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-gradient-to-br p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg",
        surface,
        ring,
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", accentBar)}
        aria-hidden
      />
      <div className="flex flex-1 flex-col gap-4">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            iconGradient,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#2A2E33]">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#5a6b7c]">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#2F8F8C] transition group-hover:gap-2">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
