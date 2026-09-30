"use client";

import {
  ComplianceBadge,
  ConnectionStatusBadge,
  InsuranceBadge,
  SafetyRatingStars,
} from "./ComplianceBadge";
import { QuickCheckTrigger } from "@/src/components/quickcheck";
import type { ContractorProfile } from "@/lib/contractor-directory-api";

export function ContractorProfileView({
  profile,
}: {
  profile: ContractorProfile;
}) {
  const contact = (profile.contactInfo || {}) as Record<string, string>;
  const breakdown = profile.complianceBreakdown;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">
              {profile.tradeName || profile.legalName}
            </h2>
            <ConnectionStatusBadge status={profile.connection?.status} />
          </div>
          <QuickCheckTrigger
            contractorId={profile.contractorId}
            source="profile"
            label="Run QuickCheck"
          />
        </div>
        {profile.tradeName ? (
          <p className="text-sm text-zinc-600">Legal: {profile.legalName}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <ComplianceBadge score={profile.complianceScore} />
          <InsuranceBadge status={profile.insuranceStatus} />
          <SafetyRatingStars rating={profile.safetyRating} />
        </div>
      </header>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Compliance breakdown
        </h3>
        <ul className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <li className="border border-zinc-200 px-3 py-2">
            Documents ({Math.round(breakdown.weights.documents * 100)}%):{" "}
            <strong>{breakdown.documentsScore}</strong>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            Audits ({Math.round(breakdown.weights.audits * 100)}%):{" "}
            <strong>{breakdown.auditsScore}</strong>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            Insurance ({Math.round(breakdown.weights.insurance * 100)}%):{" "}
            <strong>{breakdown.insuranceScore}</strong>
          </li>
          <li className="border border-zinc-200 px-3 py-2">
            PVS ({Math.round((breakdown.weights.pvs ?? 0) * 100)}%):{" "}
            <strong>{breakdown.pvsScore ?? "—"}</strong>
          </li>
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
            Contact
          </h3>
          <ul className="space-y-1 text-sm text-zinc-700">
            <li>{contact.email || "—"}</li>
            <li>{contact.phone || "—"}</li>
            <li>{contact.website || "—"}</li>
            <li>{contact.address || "—"}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
            Sites
          </h3>
          <ul className="space-y-1 text-sm">
            {(profile.sites as { id: string; name: string; region?: string }[]).map(
              (s) => (
                <li key={s.id}>
                  {s.name}
                  {s.region ? ` · ${s.region}` : ""}
                </li>
              ),
            )}
            {!profile.sites?.length ? (
              <li className="text-zinc-500">No sites listed.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
          Documents
        </h3>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {(
            profile.documents as {
              id: string;
              kind: string;
              status: string;
              label?: string;
            }[]
          ).map((d) => (
            <li key={d.id} className="flex justify-between px-3 py-2">
              <span>
                {d.label || d.kind}{" "}
                <span className="font-mono text-xs text-zinc-500">{d.kind}</span>
              </span>
              <span className="text-zinc-600">{d.status}</span>
            </li>
          ))}
          {!profile.documents?.length ? (
            <li className="px-3 py-2 text-zinc-500">No documents.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium uppercase text-zinc-500">
          Audits
        </h3>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {(
            profile.audits as {
              id: string;
              title: string;
              result: string;
              score?: number;
              auditedAt: string;
            }[]
          ).map((a) => (
            <li key={a.id} className="flex justify-between px-3 py-2">
              <span>
                {a.title}{" "}
                <span className="text-xs text-zinc-500">
                  {new Date(a.auditedAt).toLocaleDateString()}
                </span>
              </span>
              <span>
                {a.result}
                {a.score != null ? ` (${a.score})` : ""}
              </span>
            </li>
          ))}
          {!profile.audits?.length ? (
            <li className="px-3 py-2 text-zinc-500">No audits.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
