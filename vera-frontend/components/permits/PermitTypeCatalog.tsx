"use client";

import Link from "next/link";
import { SfCard } from "@/src/components/safety-forms/ui";
import { permitTypeLabel, type PermitTypeDefinition } from "@/lib/pm-permits";

type Props = {
  types: PermitTypeDefinition[];
  query: string;
};

export function PermitTypeCatalog({ types, query }: Props) {
  if (!types.length) {
    return (
      <SfCard className="p-6 text-sm text-[var(--sf-text-muted)]">
        No permit templates loaded. Run Vera Core catalog seed to populate types.
      </SfCard>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {types.map((t) => {
        const permitType = String(t.permitType ?? "");
        return (
          <li key={t.id}>
            <Link href={`/pm/permits/new?type=${permitType}${query.replace("?", "&")}`}>
              <SfCard className="h-full p-5 transition hover:border-[var(--sf-primary)]">
                <p className="font-semibold text-[#2A2E33]">{t.name}</p>
                {t.description ? (
                  <p className="mt-2 text-sm text-[var(--sf-text-muted)]">{t.description}</p>
                ) : null}
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#247A78]">
                  {permitTypeLabel(permitType)}
                </p>
                <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                  {(t.requiredFields ?? []).length} required fields ·{" "}
                  {(t.requiredTraining ?? []).length} training items
                </p>
              </SfCard>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
