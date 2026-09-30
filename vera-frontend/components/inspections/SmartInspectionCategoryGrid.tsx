"use client";



import { SfCard } from "@/src/components/safety-forms/ui";

import type { SmartInspectionCatalog } from "@/lib/inspections-catalog";



type SmartInspectionCategoryGridProps = {

  categories: SmartInspectionCatalog["categories"];

  focusAuditCount?: number;

};



export function SmartInspectionCategoryGrid({

  categories,

  focusAuditCount,

}: SmartInspectionCategoryGridProps) {

  if (!categories.length) return null;



  return (

    <section className="space-y-3">

      <header>

        <h2 className="text-lg font-semibold text-[#2A2E33]">Smart inspection programs</h2>

        <p className="mt-1 text-sm text-[#5a6b7c]">

          Seeded categories from Vera Core — use Smart Site for full walkdowns or Focus Audits for

          targeted industry programs

          {focusAuditCount != null ? ` (${focusAuditCount} focus audits available)` : ""}.

        </p>

      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {categories.map((cat) => (

          <li key={cat.id}>

            <SfCard className="h-full p-4">

              <p className="font-medium text-[#2A2E33]">{cat.name}</p>

              {cat.description ? (

                <p className="mt-1 text-sm text-[var(--sf-text-muted)]">{cat.description}</p>

              ) : null}

              {cat.industry ? (

                <p className="mt-2 text-xs uppercase tracking-wide text-[#247A78]">

                  {String(cat.industry).replace(/_/g, " ")}

                </p>

              ) : null}

            </SfCard>

          </li>

        ))}

      </ul>

    </section>

  );

}


