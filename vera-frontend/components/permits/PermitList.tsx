"use client";

import Link from "next/link";
import { SfCard } from "@/src/components/safety-forms/ui";
import {
  formatPermitStatus,
  permitTypeLabel,
  type PmPermitRecord,
} from "@/lib/pm-permits";

type Props = {
  permits: PmPermitRecord[];
  query: string;
  emptyMessage: string;
};

export function PermitList({ permits, query, emptyMessage }: Props) {
  if (!permits.length) {
    return (
      <SfCard className="p-6 text-sm text-[var(--sf-text-muted)]">{emptyMessage}</SfCard>
    );
  }

  return (
    <ul className="space-y-3">
      {permits.map((p) => (
        <li key={p.id}>
          <Link href={`/pm/permits/${p.id}${query}`}>
            <SfCard className="p-4 transition hover:border-[var(--sf-primary)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#2A2E33]">{p.title}</p>
                  <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                    {permitTypeLabel(p.permitType)} · {formatPermitStatus(p.status)}
                  </p>
                </div>
                <div className="text-right text-xs text-[var(--sf-text-muted)]">
                  {p.validTo ? (
                    <p>Valid to {new Date(p.validTo).toLocaleString()}</p>
                  ) : (
                    <p>Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </SfCard>
          </Link>
        </li>
      ))}
    </ul>
  );
}
