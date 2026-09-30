"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  archivePmInspectionTemplate,
  getPmTemplateKind,
  listPmInspectionTemplatesForBuilder,
  newPmInspectionTemplateVersion,
  PM_CHECKLIST_LIBRARY_GROUPS,
  publishPmInspectionTemplate,
  seedPmInspectionTemplates,
  type PmInspectionTemplate,
} from "@/lib/pm-inspections";
import { apiLoadErrorMessage } from "@/lib/network-error-message";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { PmLoadingState, PmPageShell } from "@/src/components/pm/layout";

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}

const GROUP_ORDER = [
  "equipment",
  "site",
  "construction",
  "environmental",
  "emergency",
  "general",
  "custom",
] as const;

export default function PmInspectionTemplatesPage({
  projectId = 1,
  companyId = 1,
  initialTemplates = [],
  libraryError = null,
}: {
  projectId?: number;
  companyId?: number;
  initialTemplates?: PmInspectionTemplate[];
  libraryError?: string | null;
}) {
  const {
    companyId: scopedCompanyId,
    projectId: scopedProjectId,
    query,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(companyId, projectId);
  const [templates, setTemplates] = useState<PmInspectionTemplate[]>(initialTemplates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryNote, setLibraryNote] = useState<string | null>(null);
  const [ready, setReady] = useState(initialTemplates.length > 0);
  const [loadError, setLoadError] = useState<string | null>(libraryError);

  const reload = useCallback(() => {
    return listPmInspectionTemplatesForBuilder(scopedCompanyId, scopedProjectId, {
      session,
    })
      .then((rows) => setTemplates(Array.isArray(rows) ? rows : []))
      .catch(() => setTemplates([]));
  }, [scopedCompanyId, scopedProjectId, session]);

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated || !tokenReady) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const ctx = { session };
    // Load the full builder list (all statuses) so custom drafts appear, not just
    // published system templates. Seed when the checklist kind is missing so a
    // partial library still backfills.
    const load = async () => {
      let rows = await listPmInspectionTemplatesForBuilder(
        scopedCompanyId,
        scopedProjectId,
        ctx,
      );
      if (!Array.isArray(rows)) rows = [];
      const hasChecklist = rows.some((t) => getPmTemplateKind(t) === "checklist");
      if (!hasChecklist) {
        const result = await seedPmInspectionTemplates(scopedCompanyId, scopedProjectId, ctx);
        if (result?.created) {
          setLibraryNote(
            `Loaded ${result.created} new library template${result.created === 1 ? "" : "s"}.`,
          );
        }
        rows = await listPmInspectionTemplatesForBuilder(
          scopedCompanyId,
          scopedProjectId,
          ctx,
        );
        if (!Array.isArray(rows)) rows = [];
      }
      if (!cancelled) setTemplates(rows);
    };

    if (initialTemplates.length === 0) setReady(false);
    void load()
      .catch((e) => {
        if (!cancelled) setLoadError(apiLoadErrorMessage(e, "Could not load templates"));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    authenticated,
    tokenReady,
    scopedCompanyId,
    scopedProjectId,
    session,
    initialTemplates.length,
  ]);

  const checklists = useMemo(
    () => templates.filter((t) => getPmTemplateKind(t) === "checklist"),
    [templates],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PmInspectionTemplate[]>();
    for (const t of checklists) {
      const group =
        t.scoringRules?.libraryGroup ??
        (t.status === "draft" ? "custom" : "general");
      const list = map.get(group) ?? [];
      list.push(t);
      map.set(group, list);
    }
    return map;
  }, [checklists]);

  async function handlePublish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await publishPmInspectionTemplate(id, { session });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id: string, name: string) {
    if (!window.confirm(`Archive "${name}"? It will be removed from active template lists.`)) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await archivePmInspectionTemplate(id, { session });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Archive failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleNewVersion(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const next = await newPmInspectionTemplateVersion(id, { session });
      await reload();
      window.location.href = `/pm/inspections/templates/build?templateId=${next.id}&projectId=${scopedProjectId}&companyId=${scopedCompanyId}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Version failed");
    } finally {
      setBusyId(null);
    }
  }

  const buildHref = `/pm/inspections/templates/build?projectId=${scopedProjectId}&companyId=${scopedCompanyId}`;

  function renderTemplateCard(t: PmInspectionTemplate) {
    return (
      <SfCard key={t.id} className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--sf-text-muted)]">
              {t.category} · v{t.version ?? 1} · {statusBadge(t.status)} ·{" "}
              {(t.items ?? []).length} items
            </p>
            {t.description ? (
              <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
                {t.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${buildHref}&templateId=${t.id}`}
              className="text-sm text-[var(--sf-primary)] hover:underline"
            >
              {t.status === "published" ? "View" : "Edit"}
            </Link>
            {t.status === "draft" ? (
              <SfButton
                type="button"
                size="sm"
                disabled={busyId === t.id}
                onClick={() => void handlePublish(t.id)}
              >
                Publish
              </SfButton>
            ) : null}
            {t.status === "published" ? (
              <SfButton
                type="button"
                size="sm"
                variant="secondary"
                disabled={busyId === t.id}
                onClick={() => void handleNewVersion(t.id)}
              >
                New version
              </SfButton>
            ) : null}
            {t.status === "published" ? (
              <Link
                href={`/pm/inspections/new?templateId=${t.id}${query.replace("?", "&")}`}
                className="self-center text-sm text-[var(--sf-primary)] hover:underline"
              >
                Use
              </Link>
            ) : null}
            {t.status !== "archived" ? (
              <SfButton
                type="button"
                size="sm"
                variant="secondary"
                disabled={busyId === t.id}
                onClick={() => void handleArchive(t.id, t.name)}
              >
                Archive
              </SfButton>
            ) : null}
          </div>
        </div>
      </SfCard>
    );
  }

  return (
    <PmPageShell
      title="Checklist templates"
      description="Company checklist library plus your custom drafts — publish, version, and start inspections."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to manage checklist templates.",
      }}
      actions={
        <Link
          href={buildHref}
          className="rounded-lg bg-[var(--sf-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Build template
        </Link>
      }
    >
      {loadError ? (
        <p className="text-sm text-amber-700" role="status">
          {loadError}
        </p>
      ) : null}

      {libraryNote ? (
        <p className="text-sm text-green-700" role="status">
          {libraryNote}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <SfCard className="p-4 text-sm text-[var(--sf-text-muted)]">
        System checklists are shared across all projects in your company. Focus audits and Smart
        Site templates are managed from their dedicated inspection flows.
      </SfCard>

      {GROUP_ORDER.map((group) => {
        const items = grouped.get(group);
        if (!items?.length) return null;
        const title =
          group === "custom"
            ? "Custom templates"
            : (PM_CHECKLIST_LIBRARY_GROUPS[group] ?? group);
        return (
          <section key={group} className="space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <ul className="space-y-3">{items.map(renderTemplateCard)}</ul>
          </section>
        );
      })}

      {ready && authenticated && !checklists.length ? (
        <p className="text-sm text-[var(--sf-text-muted)]">
          No checklist templates yet.{" "}
          <Link href={buildHref} className="text-[var(--sf-primary)] underline">
            Build one
          </Link>{" "}
          or reload this page to seed the default library.
        </p>
      ) : null}
    </PmPageShell>
  );
}
