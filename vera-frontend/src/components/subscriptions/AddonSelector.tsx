"use client";

import type { SubscriptionCatalog } from "@/lib/subscriptions-api";
import { cn } from "@/src/lib/utils";

type Props = {
  addons: SubscriptionCatalog["addons"];
  selected: string[];
  onChange: (keys: string[]) => void;
};

export function AddonSelector({ addons, selected, onChange }: Props) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#2A2E33]">Add-ons</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {addons.map((addon) => {
          const on = selected.includes(addon.key);
          return (
            <button
              key={addon.key}
              type="button"
              onClick={() => toggle(addon.key)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                on
                  ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/30"
                  : "border-[#2A2E33]/10 bg-white hover:border-teal-500/30",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-[#2A2E33]">{addon.name}</span>
                <span className="text-sm font-medium text-teal-700">
                  ${addon.priceMonthly}/mo
                </span>
              </div>
              <p className="mt-1 text-sm text-[#5a6b7c]">{addon.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
