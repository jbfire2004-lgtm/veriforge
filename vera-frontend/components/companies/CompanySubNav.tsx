"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useCompanyComplianceAccess } from "@/hooks/useCompanyComplianceAccess";

type Props = {
  companyId: number;
};

export function CompanySubNav({ companyId }: Props) {
  const pathname = usePathname();
  const { canViewCompliance, loading } = useCompanyComplianceAccess();

  const base = `/companies/${companyId}`;
  const items = [
    { href: base, label: "Overview", match: (p: string) => p === base },
    ...(canViewCompliance
      ? [
          {
            href: `${base}/compliance`,
            label: "Compliance",
            match: (p: string) => p.startsWith(`${base}/compliance`),
          },
        ]
      : []),
  ];

  if (loading || items.length <= 1) return null;

  return (
    <nav
      className="flex flex-wrap gap-1 rounded-xl border border-vera-charcoal/10 bg-white/80 p-1 shadow-sm"
      aria-label="Company sections"
    >
      {items.map((item) => {
        const active = item.match(pathname ?? "");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-vera-deep text-white shadow-sm"
                : "text-vera-muted hover:bg-vera-surface hover:text-vera-deep",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label === "Compliance" ? (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
