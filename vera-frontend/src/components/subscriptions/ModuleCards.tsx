"use client";

import { Check } from "lucide-react";
import type { SubscriptionCatalog } from "@/lib/subscriptions-api";

type Props = {
  modules: SubscriptionCatalog["modules"];
};

export function ModuleCards({ modules }: Props) {
  return (
    <section aria-labelledby="modules-heading" className="space-y-6">
      <div>
        <h2 id="modules-heading" className="text-2xl font-semibold text-[#2A2E33]">
          Vera modules
        </h2>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Hub, Core, PM, and optional add-ons — each tier unlocks more capability.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <article
            key={mod.key}
            className="flex flex-col rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[#2A2E33]">{mod.title}</h3>
            <p className="mt-2 flex-1 text-sm text-[#5a6b7c]">{mod.description}</p>
            <ul className="mt-4 space-y-2">
              {mod.includedFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#2A2E33]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#5a6b7c]">
              Available on:{" "}
              <span className="normal-case text-teal-700">
                {mod.tierAvailability.slice(0, 4).join(", ")}
                {mod.tierAvailability.length > 4 ? "…" : ""}
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
