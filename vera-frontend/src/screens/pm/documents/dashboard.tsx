"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  acknowledgePmDocument,
  createPmSds,
  fetchDocumentAnalytics,
  fetchDocumentIntelligence,
  listChemicalInventory,
  listPmPolicies,
  listPmSds,
  publishPmSds,
  scanChemicalDeficiencies,
  type ChemicalInventoryRow,
  type PmSdsRecord,
} from "@/lib/pm-document-control";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

type Tab = "sds" | "chemicals" | "policies" | "insights";

export default function PmDocumentsDashboardPage({
  projectId = 1,
  companyId = 1,
  workerId = 1,
}: {
  projectId?: number;
  companyId?: number;
  workerId?: number;
}) {
  const [tab, setTab] = useState<Tab>("sds");
  const [sds, setSds] = useState<PmSdsRecord[]>([]);
  const [inventory, setInventory] = useState<ChemicalInventoryRow[]>([]);
  const [policies, setPolicies] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [productName, setProductName] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  function reload() {
    void listPmSds(companyId, projectId).then(setSds).catch(() => undefined);
    void listChemicalInventory(projectId).then(setInventory).catch(() => undefined);
    void listPmPolicies(companyId, projectId).then(setPolicies).catch(() => undefined);
    void fetchDocumentAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchDocumentIntelligence(projectId).then(setInsights).catch(() => undefined);
  }

  useEffect(() => {
    reload();
  }, [projectId, companyId]);

  async function addSds() {
    if (!productName.trim()) return;
    await createPmSds({
      companyId,
      projectId,
      productName: productName.trim(),
      manufacturer: manufacturer.trim() || undefined,
    });
    setProductName("");
    setManufacturer("");
    reload();
  }

  return (
    <VeraPageLayout
      title="SDS & Document Control"
      description={`SDS library, chemical inventory, policies, acknowledgments, and CAIL insights — project #${projectId}`}
    >
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">SDS total</p>
            <p className="text-2xl font-semibold">{String(analytics.sdsTotal)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Expiring (30d)</p>
            <p className="text-2xl font-semibold text-amber-600">
              {String(analytics.sdsExpiringSoon)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Expired SDS</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.sdsExpired)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Missing SDS</p>
            <p className="text-2xl font-semibold">{String(analytics.missingSds)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Policy ack %</p>
            <p className="text-2xl font-semibold">
              {String(analytics.policyAckCompliancePct)}%
            </p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["sds", "SDS library"],
            ["chemicals", "Chemical inventory"],
            ["policies", "Policies & ack"],
            ["insights", "CAIL insights"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-md bg-[var(--sf-primary)] px-3 py-1.5 text-sm text-white"
                : "rounded-md px-3 py-1.5 text-sm text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface)]"
            }
          >
            {label}
          </button>
        ))}
        <SfButton
          type="button"
          variant="secondary"
          className="ml-auto"
          onClick={() => void scanChemicalDeficiencies(projectId).then(reload)}
        >
          Scan deficiencies → CAPA
        </SfButton>
      </div>

      {tab === "sds" ? (
        <>
          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">Add SDS (draft)</h2>
            <SfInput
              placeholder="Product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <SfInput
              placeholder="Manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
            <SfButton type="button" onClick={() => void addSds()}>
              Save draft
            </SfButton>
          </SfCard>
          <SfCard className="p-5">
            <h2 className="mb-3 font-medium">SDS library ({sds.length})</h2>
            <ul className="divide-y text-sm">
              {sds.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    <span className="font-medium">{d.productName}</span>
                    <span className="text-[var(--sf-text-muted)]">
                      {" "}
                      — {d.status} v{d.version}
                      {d.expiresAt
                        ? ` · exp ${new Date(d.expiresAt).toLocaleDateString()}`
                        : ""}
                    </span>
                  </span>
                  {d.status === "draft" ? (
                    <SfButton
                      type="button"
                      variant="secondary"
                      onClick={() => void publishPmSds(d.id).then(reload)}
                    >
                      Publish
                    </SfButton>
                  ) : null}
                </li>
              ))}
            </ul>
          </SfCard>
        </>
      ) : null}

      {tab === "chemicals" ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Chemical inventory ({inventory.length})</h2>
          <ul className="divide-y text-sm">
            {inventory.map((row) => (
              <li key={row.id} className="py-2">
                <span className="font-medium">
                  {row.productName ?? row.sdsDocument?.productName ?? "Unnamed"}
                </span>
                {row.missingSdsFlag ? (
                  <span className="ml-2 text-red-600">Missing SDS</span>
                ) : null}
                {row.chemicalExpiry ? (
                  <span className="text-[var(--sf-text-muted)]">
                    {" "}
                    · exp {new Date(row.chemicalExpiry).toLocaleDateString()}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "policies" ? (
        <SfCard className="p-5">
          <h2 className="mb-3 font-medium">Published policies ({policies.length})</h2>
          <ul className="divide-y text-sm">
            {policies.map((p) => (
              <li key={String(p.id)} className="flex justify-between py-2">
                <span className="font-medium">{String(p.title)}</span>
                <SfButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void acknowledgePmDocument({
                      workerId,
                      policyDocumentId: String(p.id),
                      signatureData: `worker:${workerId}`,
                    }).then(reload)
                  }
                >
                  Acknowledge
                </SfButton>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {tab === "insights" ? (
        <SfCard className="space-y-3 p-5">
          <h2 className="font-medium">CAIL document intelligence</h2>
          {insights.length === 0 ? (
            <p className="text-sm text-[var(--sf-text-muted)]">No active insights.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {insights.map((i, idx) => (
                <li key={idx} className="rounded border p-3">
                  <p className="font-medium">{String(i.title)}</p>
                  <p className="text-[var(--sf-text-muted)]">{String(i.explanation)}</p>
                  <p className="mt-1 text-xs">
                    Score {String(i.score)} · confidence {String(i.confidence)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
