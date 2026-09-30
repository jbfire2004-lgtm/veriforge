"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  cloneAuditTemplate,
  createAuditTemplate,
  listAuditTemplates,
  type AuditTemplate,
} from "@/lib/audit-evaluation-api";

/**
 * Lightweight template builder — create/clone templates with section weights.
 */
export function TemplateBuilderPanel() {
  const [items, setItems] = useState<AuditTemplate[]>([]);
  const [name, setName] = useState("Custom safety audit");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const data = await listAuditTemplates();
    setItems(data.items);
  }

  useEffect(() => {
    void reload().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed"),
    );
  }, []);

  async function onQuickCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createAuditTemplate({
        name,
        category: "safety",
        sections: [
          {
            title: "General",
            weight: 100,
            questions: [
              {
                prompt: "Overall compliance readiness",
                questionType: "score",
                weight: 1,
                maxScore: 100,
              },
            ],
          },
        ],
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 border border-zinc-200 p-4">
      <h3 className="font-medium">Template builder</h3>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ul className="space-y-2 text-sm">
        {items.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 py-2"
          >
            <span>
              {t.name}{" "}
              <span className="text-xs text-zinc-500">
                v{t.version}
                {!t.orgId ? " · platform" : ""} · {t.sections?.length || 0}{" "}
                sections
              </span>
            </span>
            {!t.orgId ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void cloneAuditTemplate(t.id)
                    .then(reload)
                    .catch((e) =>
                      setError(e instanceof Error ? e.message : "Clone failed"),
                    )
                }
              >
                Clone
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <form onSubmit={onQuickCreate} className="flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={busy}>
          Quick create
        </Button>
      </form>
    </div>
  );
}
