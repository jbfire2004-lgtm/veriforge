"use client";

import Link from "next/link";
import type { SmsCoreIntegration } from "@/lib/sms-core-integrations";

type Props = {
  items: SmsCoreIntegration[];
  title?: string;
};

/** Compact federation strip for Projects / FieldOS operational shells. */
export function SmsCoreFederationStrip({
  items,
  title = "SMS Core federation",
}: Props) {
  return (
    <section className="rounded-xl border border-[#2A2E33]/15 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2E33]/12 px-2.5 py-1.5 text-xs font-medium text-[#2A2E33] transition hover:border-[#2F8F8C]/50 hover:bg-[#2F8F8C]/5"
            >
              <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
