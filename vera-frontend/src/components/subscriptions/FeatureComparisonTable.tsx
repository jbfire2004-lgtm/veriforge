"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { SubscriptionCatalog } from "@/lib/subscriptions-api";
import { cn } from "@/src/lib/utils";

type Props = {
  comparison: SubscriptionCatalog["comparison"];
};

function Cell({ value }: { value: boolean | "addon" }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-teal-600" aria-label="Included" />;
  }
  if (value === "addon") {
    return (
      <span className="mx-auto flex items-center justify-center gap-0.5 text-xs font-medium text-amber-700">
        <Plus className="h-3 w-3" aria-hidden />
        Add-on
      </span>
    );
  }
  return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Not included" />;
}

export function FeatureComparisonTable({ comparison }: Props) {
  const { tierKeys, tierLabels, rows } = comparison;

  return (
    <section aria-labelledby="compare-heading" className="space-y-6">
      <div>
        <h2 id="compare-heading" className="text-2xl font-semibold text-[#2A2E33]">
          Feature comparison
        </h2>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Compare capabilities across every Vera subscription tier.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#2A2E33]/10 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="sticky left-0 z-10 bg-slate-50/95 px-4 py-3 font-semibold text-[#2A2E33]">
                Feature
              </th>
              {tierKeys.map((key) => (
                <th
                  key={key}
                  className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#5a6b7c]"
                >
                  {tierLabels[key] ?? key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.key}
                className={cn(
                  "border-b border-slate-50",
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 font-medium text-[#2A2E33]">
                  {row.label}
                </td>
                {tierKeys.map((tierKey) => (
                  <td key={tierKey} className="px-3 py-2.5 text-center">
                    <Cell value={row.tiers[tierKey] ?? false} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
