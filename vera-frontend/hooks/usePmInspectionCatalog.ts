"use client";

import { useEffect, useState } from "react";
import {
  fetchInspectionTemplates,
  fetchSmartInspectionCatalog,
  fetchInspectionChecklists,
  type InspectionChecklistCatalog,
  type InspectionTemplateCatalog,
  type SmartInspectionCatalog,
} from "@/lib/inspections-catalog";
import { getPmTemplateKind, type PmInspectionTemplate } from "@/lib/pm-inspections";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

const REQUIRED_KINDS = ["smart_site", "focus_audit", "checklist"] as const;

function isMissingKinds(templates: PmInspectionTemplate[]) {
  if (templates.length === 0) return true;
  const present = new Set(templates.map((t) => getPmTemplateKind(t)));
  return REQUIRED_KINDS.some((k) => !present.has(k));
}

/**
 * Loads inspection templates from Vera Core catalog endpoints once auth + token are ready.
 */
export function usePmInspectionCatalog(
  queryCompanyId: number,
  queryProjectId?: number,
  initialTemplates: PmInspectionTemplate[] = [],
  initialError?: string | null,
) {
  const projectId = queryProjectId ?? 1;
  const {
    companyId,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  } = usePmInspectionScope(queryCompanyId, projectId);

  const [templates, setTemplates] = useState<PmInspectionTemplate[]>(initialTemplates);
  const [counts, setCounts] = useState<InspectionTemplateCatalog["counts"] | null>(null);
  const [smartCatalog, setSmartCatalog] = useState<SmartInspectionCatalog | null>(null);
  const [checklistCatalog, setChecklistCatalog] = useState<InspectionChecklistCatalog | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [ready, setReady] = useState(initialTemplates.length > 0);

  useEffect(() => {
    if (authLoading || sessionExpired) return;
    if (!authenticated || !tokenReady) return;

    let cancelled = false;
    // Keep prior/SSR templates visible while refreshing — avoids empty “could not reach”
    // flashes when Nest is briefly restarting.
    if (initialTemplates.length === 0) setReady(false);
    setError(null);

    const load = async () => {
      let catalog = await fetchInspectionTemplates(companyId, projectId, { session });
      if (cancelled) return;

      if (isMissingKinds(catalog.templates)) {
        catalog = await fetchInspectionTemplates(companyId, projectId, {
          session,
        });
      }
      if (cancelled) return;

      setTemplates(catalog.templates);
      setCounts(catalog.counts);
      setReady(true);

      // Soft-fail secondary catalogs so Focus Audits / Smart Site still render
      // when Nest is flapping or checklists/pm is unavailable.
      try {
        const smart = await fetchSmartInspectionCatalog(companyId, projectId, session);
        if (cancelled) return;
        setSmartCatalog(smart);
        setCounts((prev) => catalog.counts ?? smart.counts ?? prev);
      } catch {
        /* keep templates */
      }

      try {
        const checklists = await fetchInspectionChecklists(
          companyId,
          projectId,
          session,
        );
        if (cancelled) return;
        setChecklistCatalog(checklists);
      } catch {
        /* keep templates */
      }
    };

    void load()
      .catch((e) => {
        if (!cancelled) {
          // Only surface a hard error when we have nothing usable to show.
          if (initialTemplates.length === 0) {
            setError(apiLoadErrorMessage(e, "Could not load inspection library"));
          }
        }
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
    sessionExpired,
    companyId,
    projectId,
    session?.accessToken,
    initialTemplates.length,
  ]);

  const byKind = (kind: string) =>
    templates.filter((t) => getPmTemplateKind(t) === kind);

  return {
    templates,
    checklists: byKind("checklist"),
    focusAudits: byKind("focus_audit"),
    smartSiteTemplate:
      smartCatalog?.smartSiteTemplate ?? byKind("smart_site")[0] ?? null,
    smartCategories: smartCatalog?.categories ?? [],
    coreChecklists: checklistCatalog?.core ?? [],
    checklistCatalogCounts: checklistCatalog?.counts ?? null,
    counts,
    error,
    ready: ready || initialTemplates.length > 0,
    companyId,
    projectId,
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
    reload: () => {
      if (!tokenReady) return;
      setReady(false);
      void fetchInspectionTemplates(companyId, projectId, { session })
        .then((c) => {
          setTemplates(c.templates);
          setCounts(c.counts);
        })
        .catch((e) => setError(apiLoadErrorMessage(e, "Could not reload")))
        .finally(() => setReady(true));
    },
  };
}

/** @deprecated Use {@link usePmInspectionCatalog} */
export const usePmInspectionLibrary = usePmInspectionCatalog;
