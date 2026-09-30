"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import {
  clearDocumentExemption,
  expireDocument,
  fetchDocumentDashboard,
  getDocument,
  listDocuments,
  type CategoryRule,
  type DocumentCenterDocument,
  type DocumentDashboard,
} from "@/lib/document-center-api";
import {
  DocumentDashboardIndicators,
  DocumentStatusBadge,
} from "./DocumentStatusBadge";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { ExemptionModal } from "./ExemptionModal";
import { VersionViewer } from "./VersionViewer";

export function DocumentList({
  contractorId,
  canManage = true,
}: {
  contractorId: string;
  canManage?: boolean;
}) {
  const [items, setItems] = useState<DocumentCenterDocument[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [dashboard, setDashboard] = useState<DocumentDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [exemptTarget, setExemptTarget] =
    useState<DocumentCenterDocument | null>(null);
  const [versionTarget, setVersionTarget] =
    useState<DocumentCenterDocument | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [list, dash] = await Promise.all([
        listDocuments(contractorId),
        fetchDocumentDashboard(contractorId),
      ]);
      setItems(list.items);
      setRules(list.rules);
      setDashboard(dash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    }
  }, [contractorId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function openVersions(doc: DocumentCenterDocument) {
    try {
      const full = await getDocument(contractorId, doc.id);
      setVersionTarget(full);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load versions");
    }
  }

  async function onExpire(doc: DocumentCenterDocument) {
    if (!confirm(`Mark "${doc.title}" as expired?`)) return;
    setBusy(true);
    try {
      await expireDocument(contractorId, doc.id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Expire failed");
    } finally {
      setBusy(false);
    }
  }

  async function onClearExempt(doc: DocumentCenterDocument) {
    setBusy(true);
    try {
      await clearDocumentExemption(contractorId, doc.id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Document Center</h2>
        {canManage ? (
          <Button type="button" onClick={() => setUploadOpen(true)}>
            Upload
          </Button>
        ) : null}
      </div>

      {dashboard ? (
        <DocumentDashboardIndicators
          indicators={dashboard.indicators}
          totals={dashboard.totals}
        />
      ) : null}

      {dashboard?.byCategory?.length ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.byCategory.map((c) => (
            <li
              key={c.category}
              className="border border-zinc-200 px-3 py-2 text-sm"
            >
              <div className="font-medium">{c.label}</div>
              <div className="text-zinc-600">
                {c.count} doc{c.count === 1 ? "" : "s"}
                {c.required && !c.satisfied ? " · missing" : ""}
                {c.expiring ? ` · ${c.expiring} expiring` : ""}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Expiry</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((doc) => (
              <tr key={doc.id}>
                <td className="px-3 py-2 font-medium">{doc.title}</td>
                <td className="px-3 py-2 capitalize">
                  {doc.category.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-2">
                  <DocumentStatusBadge status={doc.status} />
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {doc.expiryDate
                    ? new Date(doc.expiryDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-3 py-2">v{doc.currentVersion}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void openVersions(doc)}
                    >
                      Versions
                    </Button>
                    {canManage && !doc.exemptionFlag ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => setExemptTarget(doc)}
                      >
                        Exempt
                      </Button>
                    ) : null}
                    {canManage && doc.exemptionFlag ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => void onClearExempt(doc)}
                      >
                        Clear exempt
                      </Button>
                    ) : null}
                    {canManage && doc.status !== "expired" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => void onExpire(doc)}
                      >
                        Expire
                      </Button>
                    ) : null}
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center border border-zinc-300 px-2 py-1 text-xs"
                      >
                        Open
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-zinc-500"
                >
                  No documents yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <UploadDocumentModal
        contractorId={contractorId}
        rules={rules}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDone={() => void reload()}
      />
      <ExemptionModal
        contractorId={contractorId}
        documentId={exemptTarget?.id || ""}
        documentTitle={exemptTarget?.title || ""}
        open={!!exemptTarget}
        onClose={() => setExemptTarget(null)}
        onDone={() => void reload()}
      />
      <VersionViewer
        open={!!versionTarget}
        title={versionTarget?.title || ""}
        versions={versionTarget?.versions || []}
        onClose={() => setVersionTarget(null)}
      />
    </div>
  );
}
