"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import {
  createEvaluationAudit,
  listAuditTemplates,
  listEvaluationAudits,
  type AuditTemplate,
  type EvaluationAudit,
} from "@/lib/audit-evaluation-api";
import { AuditScorePill, AuditStatusBadge } from "./AuditStatusBadge";

export function AuditList({
  contractorId,
  basePath = "/verihub/audits",
  canManage = true,
}: {
  contractorId: string;
  basePath?: string;
  canManage?: boolean;
}) {
  const [items, setItems] = useState<EvaluationAudit[]>([]);
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [list, tpls] = await Promise.all([
        listEvaluationAudits({ contractorId }),
        listAuditTemplates(),
      ]);
      setItems(list.items);
      setTemplates(tpls.items);
      if (!templateId && tpls.items[0]) setTemplateId(tpls.items[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audits");
    }
  }, [contractorId, templateId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) return;
    setBusy(true);
    setError(null);
    try {
      await createEvaluationAudit({
        contractorId,
        templateId,
        title: title.trim() || undefined,
      });
      setTitle("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Audits & evaluations</h2>
      </div>

      {canManage ? (
        <form
          onSubmit={onCreate}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 p-4"
        >
          <label className="space-y-1 text-sm">
            <span>Template</span>
            <select
              className="block w-56 border border-zinc-300 px-3 py-2"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              required
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {!t.orgId ? " (platform)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Title (optional)</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 safety review"
            />
          </label>
          <Button type="submit" disabled={busy || !templateId}>
            {busy ? "Creating…" : "New audit"}
          </Button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Template</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Reviewer</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-2 font-medium">{a.title}</td>
                <td className="px-3 py-2 text-zinc-600">
                  {a.template && "name" in a.template
                    ? a.template.name
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  <AuditStatusBadge status={a.status} />
                </td>
                <td className="px-3 py-2">
                  <AuditScorePill score={a.score} />
                </td>
                <td className="px-3 py-2 text-zinc-600">
                  {a.reviewerName || a.reviewerId?.slice(0, 8) || "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`${basePath}/${a.id}`}
                    className="text-sky-700 underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-zinc-500"
                >
                  No audits yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
