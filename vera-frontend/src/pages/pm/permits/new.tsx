"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PermitWorkflowForm, SmartPermitPanel } from "@/components/permits";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  createPmPermitRecord,
  fetchPermitTypes,
  permitTypeLabel,
  type PermitTypeDefinition,
  type PermitWorkflow,
} from "@/lib/pm-permits";
import { SfButton, SfInput } from "@/src/components/safety-forms/ui";
import { PmPageShell, PmSurfaceCard } from "@/src/components/pm/layout";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

export default function PmPermitNewPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") ?? "hot_work";
  const { query, session, tokenReady, authLoading, authenticated, sessionExpired } =
    usePmInspectionScope(companyId, projectId);

  const [types, setTypes] = useState<PermitTypeDefinition[]>([]);
  const [title, setTitle] = useState("");
  const [workflow, setWorkflow] = useState<PermitWorkflow>({ signoffs: [], trainingValidated: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenReady) return;
    void fetchPermitTypes({ session })
      .then((res) => setTypes(res.types ?? []))
      .catch(() => undefined);
  }, [tokenReady, session?.accessToken]);

  const typeDef = useMemo(
    () => types.find((t) => String(t.permitType) === typeParam) ?? types[0],
    [types, typeParam],
  );

  useEffect(() => {
    if (!typeDef) return;
    setTitle((prev) => prev || typeDef.name);
    setWorkflow((prev) => ({
      ...prev,
      hazards: typeDef.defaultHazardKeys ?? [],
      controls: typeDef.defaultControlKeys ?? [],
    }));
  }, [typeDef]);

  async function saveDraft() {
    if (!typeDef) return;
    setBusy(true);
    setError(null);
    try {
      const row = await createPmPermitRecord(
        projectId,
        {
          permitType: String(typeDef.permitType),
          title: title || typeDef.name,
          workflow,
        },
        { session },
      );
      router.push(`/pm/permits/${row.id}${query}`);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Could not create permit"));
      setBusy(false);
    }
  }

  return (
    <PmPageShell
      title={`New ${permitTypeLabel(typeParam)} permit`}
      description="Complete job scope, hazards, controls, training validation, and signoff."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to create permits.",
      }}
    >
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!typeDef ? (
        <PmSurfaceCard>
          <p className="text-sm text-[var(--muted-foreground)]">Loading permit template…</p>
        </PmSurfaceCard>
      ) : (
        <>
          <SmartPermitPanel
            companyId={companyId}
            projectId={projectId}
            typeDef={typeDef}
            workflow={workflow}
            session={session}
            tokenReady={tokenReady}
            disabled={busy}
            onApply={({ title: suggestedTitle, workflow: nextWorkflow }) => {
              if (suggestedTitle) setTitle(suggestedTitle);
              setWorkflow(nextWorkflow);
            }}
          />
          <PmSurfaceCard title="Permit details">
            <SfInput label="Permit title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </PmSurfaceCard>
          <PermitWorkflowForm
            typeDef={typeDef}
            workflow={workflow}
            onChange={setWorkflow}
            disabled={busy}
            projectId={projectId}
            session={session}
            tokenReady={tokenReady}
          />
          <div className="flex gap-2">
            <SfButton type="button" disabled={busy || !tokenReady} onClick={() => void saveDraft()}>
              {busy ? "Saving…" : "Save draft permit"}
            </SfButton>
          </div>
        </>
      )}
    </PmPageShell>
  );
}
