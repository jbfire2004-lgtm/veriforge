"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PermitWorkflowForm, SmartPermitPanel } from "@/components/permits";
import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";
import {
  activatePmPermitRecord,
  approvePmPermitRecord,
  closePmPermitRecord,
  fetchPermitTypes,
  formatPermitStatus,
  getPmPermit,
  permitTypeLabel,
  submitPmPermitRecord,
  updatePmPermitRecord,
  type PermitTypeDefinition,
  type PermitWorkflow,
  type PmPermitRecord,
} from "@/lib/pm-permits";
import { SfButton } from "@/src/components/safety-forms/ui";
import { PmPageShell, PmSurfaceCard } from "@/src/components/pm/layout";
import { apiLoadErrorMessage } from "@/lib/network-error-message";

export default function PmPermitDetailPage({
  id,
  projectId = 1,
  companyId = 1,
}: {
  id: string;
  projectId?: number;
  companyId?: number;
}) {
  const { query, session, tokenReady, authLoading, authenticated, sessionExpired } =
    usePmInspectionScope(companyId, projectId);
  const [permit, setPermit] = useState<PmPermitRecord | null>(null);
  const [types, setTypes] = useState<PermitTypeDefinition[]>([]);
  const [workflow, setWorkflow] = useState<PermitWorkflow>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!tokenReady) return;
    const ctx = { session };
    void getPmPermit(id, ctx)
      .then((row) => {
        setPermit(row);
        setWorkflow(row.workflow ?? {});
      })
      .catch((e) => setError(apiLoadErrorMessage(e, "Could not load permit")));
  }, [id, session, tokenReady]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!tokenReady) return;
    void fetchPermitTypes({ session })
      .then((res) => setTypes(res.types ?? []))
      .catch(() => undefined);
  }, [tokenReady, session?.accessToken]);

  const typeDef = useMemo(
    () => types.find((t) => String(t.permitType) === permit?.permitType),
    [types, permit?.permitType],
  );

  const editable = permit != null && ["draft", "pending_approval"].includes(permit.status);

  async function saveWorkflow() {
    if (!permit) return;
    setBusy(true);
    setError(null);
    try {
      const row = await updatePmPermitRecord(id, { workflow }, { session });
      setPermit(row);
      setWorkflow(row.workflow ?? {});
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Save failed"));
    } finally {
      setBusy(false);
    }
  }

  async function runAction(
    fn: (id: string, ctx?: { session: typeof session }) => Promise<PmPermitRecord>,
  ) {
    setBusy(true);
    setError(null);
    try {
      const row = await fn(id, { session });
      setPermit(row);
    } catch (e) {
      setError(apiLoadErrorMessage(e, "Action failed"));
    } finally {
      setBusy(false);
    }
  }

  if (!permit && !error) {
    return (
      <PmPageShell
        title="Permit"
        auth={{
          authLoading,
          authenticated,
          tokenReady,
          sessionExpired,
          signInMessage: "Sign in to load permits.",
        }}
      >
        {tokenReady ? (
          <p className="text-sm text-[var(--muted-foreground)]">Loading permit…</p>
        ) : null}
      </PmPageShell>
    );
  }

  return (
    <PmPageShell
      title={permit?.title ?? "Permit"}
      description={
        permit
          ? `${permitTypeLabel(permit.permitType)} · ${formatPermitStatus(permit.status)}`
          : undefined
      }
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to load permits.",
      }}
    >
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {permit && typeDef ? (
        <>
          {editable ? (
            <SmartPermitPanel
              companyId={companyId}
              projectId={projectId}
              typeDef={typeDef}
              workflow={workflow}
              session={session}
              tokenReady={tokenReady}
              disabled={busy}
              onApply={({ workflow: nextWorkflow }) => {
                setWorkflow(nextWorkflow);
              }}
            />
          ) : null}
          <PermitWorkflowForm
            typeDef={typeDef}
            workflow={workflow}
            onChange={setWorkflow}
            disabled={!editable || busy}
            projectId={projectId}
            session={session}
            tokenReady={tokenReady}
          />
          <div className="flex flex-wrap gap-2">
            {editable ? (
              <SfButton type="button" disabled={busy} onClick={() => void saveWorkflow()}>
                Save
              </SfButton>
            ) : null}
            {permit.status === "draft" ? (
              <SfButton
                type="button"
                disabled={busy}
                onClick={() => void runAction(submitPmPermitRecord)}
              >
                Submit for approval
              </SfButton>
            ) : null}
            {permit.status === "pending_approval" ? (
              <SfButton
                type="button"
                disabled={busy}
                onClick={() => void runAction(approvePmPermitRecord)}
              >
                Approve
              </SfButton>
            ) : null}
            {permit.status === "approved" ? (
              <SfButton
                type="button"
                disabled={busy}
                onClick={() => void runAction(activatePmPermitRecord)}
              >
                Activate
              </SfButton>
            ) : null}
            {permit.status === "active" ? (
              <SfButton
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void runAction(closePmPermitRecord)}
              >
                Close permit
              </SfButton>
            ) : null}
          </div>
        </>
      ) : permit ? (
        <PmSurfaceCard>
          <p className="text-sm text-[var(--muted-foreground)]">
            Permit loaded — template metadata unavailable for {permit.permitType}.
          </p>
        </PmSurfaceCard>
      ) : null}
    </PmPageShell>
  );
}
