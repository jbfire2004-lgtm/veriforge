"use client";

import type { RenewalOptionItem } from "@/lib/renewals-api";

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function ExpiringSoonCard({
  item,
  onRenew,
}: {
  item: RenewalOptionItem;
  onRenew: (item: RenewalOptionItem) => void;
}) {
  const days = daysUntil(item.expiresOn);
  const urgent = days <= 30;

  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-[#2A2E33]">
            {item.certificationName}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              urgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {days > 0 ? `Expires in ${days} day${days === 1 ? "" : "s"}` : "Expired"}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Expires on {new Date(item.expiresOn).toLocaleDateString()} ·{" "}
          {item.options.length} vendor option{item.options.length === 1 ? "" : "s"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRenew(item)}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#247A78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F8F8C]"
      >
        Renew now
      </button>
    </article>
  );
}
