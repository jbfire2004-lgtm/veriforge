"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  exportPmSafetyPdf,
  fetchPmSafetyEvents,
  fetchPmSafetyState,
  PM_ACTOR_ROLE_KEY,
  PM_ACTOR_USER_ID_KEY,
  signPmSafetyWorkflowAsWorker,
  transitionPmSafetyWorkflow,
  type PmActorRole,
  type PmSafetyWorkflowEvent,
  type PmSafetyWorkflowState,
} from "@/lib/pm-safety-workflow";
import { unknownToErrorMessage } from "@/lib/core";
import { PmSafetyStatusBadge } from "@/src/components/pm/PmSafetyStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PmSafetyWorkflowReviewScreenProps = {
  workflowId: number;
};

export function PmSafetyWorkflowReviewScreen({
  workflowId,
}: PmSafetyWorkflowReviewScreenProps) {
  const [state, setState] = useState<PmSafetyWorkflowState | null>(null);
  const [events, setEvents] = useState<PmSafetyWorkflowEvent[]>([]);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actorUserId, setActorUserId] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(PM_ACTOR_USER_ID_KEY) ?? "";
  });
  const [actorRole, setActorRole] = useState<PmActorRole>(() => {
    if (typeof window === "undefined") return "WORKER";
    const r = sessionStorage.getItem(PM_ACTOR_ROLE_KEY);
    if (
      r === "ADMIN" ||
      r === "SUPERVISOR" ||
      r === "PROJECT_MANAGER" ||
      r === "WORKER"
    )
      return r;
    return "WORKER";
  });
  const [signText, setSignText] = useState("");

  function persistActor() {
    sessionStorage.setItem(PM_ACTOR_USER_ID_KEY, actorUserId.trim());
    sessionStorage.setItem(PM_ACTOR_ROLE_KEY, actorRole);
  }

  function validateActor():
    | { ok: true }
    | { ok: false; message: string } {
    const id = Number(actorUserId.trim());
    if (!Number.isSafeInteger(id) || id < 1) {
      return { ok: false, message: "Actor user ID must be a positive integer." };
    }
    if (
      !["ADMIN", "SUPERVISOR", "PROJECT_MANAGER", "WORKER"].includes(actorRole)
    ) {
      return {
        ok: false,
        message:
          "Actor role must be ADMIN, SUPERVISOR, PROJECT_MANAGER, or WORKER.",
      };
    }
    return { ok: true };
  }

  const load = useCallback(async () => {
    if (!Number.isFinite(workflowId)) return;
    setLoading(true);
    setError(null);
    try {
      const [s, ev] = await Promise.all([
        fetchPmSafetyState(workflowId),
        fetchPmSafetyEvents(workflowId),
      ]);
      setState(s);
      setEvents(ev);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    // Initial fetch for `workflowId`; ESLint flags any async state updates from effects in this rule set.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data load on mount / id change
    void load();
  }, [load]);

  async function runTransition(
    action: Parameters<typeof transitionPmSafetyWorkflow>[1]
  ) {
    const check = validateActor();
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      persistActor();
      await transitionPmSafetyWorkflow(
        workflowId,
        action,
        note.trim() || undefined
      );
      setNote("");
      await load();
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function runPdfExport() {
    setBusy(true);
    setPdfDownloaded(false);
    try {
      const blob = await exportPmSafetyPdf(workflowId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pm-safety-workflow-${workflowId}.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPdfDownloaded(true);
      await load();
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function runWorkerSign() {
    const check = validateActor();
    if (!check.ok) {
      setError(check.message);
      return;
    }
    if (signText.trim().length < 3) {
      setError("Attestation text is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      persistActor();
      await signPmSafetyWorkflowAsWorker(workflowId, signText.trim());
      setSignText("");
      await load();
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!Number.isFinite(workflowId)) {
    return (
      <main className="p-6">
        <p className="text-red-700">Invalid workflow id.</p>
      </main>
    );
  }

  const wf = state?.workflow;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">PM safety review</h1>
          <p className="text-sm text-slate-600">
            <Link href="/pm/safety/new" className="text-blue-700 underline">
              New workflow
            </Link>
          </p>
        </header>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading || busy}
        >
          Refresh
        </Button>
      </div>

      {loading && <p className="text-slate-600">Loading…</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actor (RBAC headers)</CardTitle>
          <CardDescription>
            Sets <code className="text-xs">x-pm-actor-user-id</code> and{" "}
            <code className="text-xs">x-pm-actor-role</code> for worker sign-off
            and supervisor transitions. Values must match real{" "}
            <code className="text-xs">User</code> rows when enforcing permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="actor-id">User ID</Label>
            <Input
              id="actor-id"
              inputMode="numeric"
              value={actorUserId}
              onChange={(e) => setActorUserId(e.target.value)}
              placeholder="e.g. 2"
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="actor-role">Role</Label>
            <select
              id="actor-role"
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={actorRole}
              onChange={(e) => setActorRole(e.target.value as PmActorRole)}
              disabled={busy}
            >
              <option value="WORKER">WORKER</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={persistActor} disabled={busy}>
              Save to session
            </Button>
          </div>
        </CardContent>
      </Card>

      {state && wf && (
        <>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-xl">{wf.title}</CardTitle>
                <CardDescription>
                  Kind: {wf.kind.replace(/_/g, " ")} · #{wf.id}
                </CardDescription>
              </div>
              <PmSafetyStatusBadge status={wf.status} />
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {wf.jobLocation && (
                <p>
                  <span className="text-slate-500">Location:</span>{" "}
                  {wf.jobLocation}
                </p>
              )}
              {wf.company && (
                <p>
                  <span className="text-slate-500">Company:</span>{" "}
                  {wf.company.name}
                </p>
              )}
              {wf.site && (
                <p>
                  <span className="text-slate-500">Site:</span> {wf.site.name}
                  {wf.site.code && ` (${wf.site.code})`}
                </p>
              )}
              {wf.workDescription && (
                <div>
                  <p className="font-medium text-slate-800">Work</p>
                  <p className="whitespace-pre-wrap text-slate-700">
                    {wf.workDescription}
                  </p>
                </div>
              )}
              {wf.hazardSummary && (
                <div>
                  <p className="font-medium text-slate-800">Hazards</p>
                  <p className="whitespace-pre-wrap text-slate-700">
                    {wf.hazardSummary}
                  </p>
                </div>
              )}
              {wf.controlMeasures && (
                <div>
                  <p className="font-medium text-slate-800">Controls</p>
                  <p className="whitespace-pre-wrap text-slate-700">
                    {wf.controlMeasures}
                  </p>
                </div>
              )}
              {wf.taskStepsJson != null && (
                <div>
                  <p className="font-medium text-slate-800">Task steps (JSON)</p>
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs">
                    {JSON.stringify(wf.taskStepsJson, null, 2)}
                  </pre>
                </div>
              )}
              <div className="grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-800">Worker sign-off</p>
                  {wf.workerSignedAt ? (
                    <p className="text-slate-700">
                      {wf.workerUser?.username ?? `User #${wf.workerUserId}`} ·{" "}
                      {new Date(wf.workerSignedAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-amber-800">Not signed yet.</p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">Supervisor approval</p>
                  {wf.supervisorApprovedAt ? (
                    <p className="text-slate-700">
                      {wf.supervisorUser?.username ??
                        `User #${wf.supervisorUserId}`}{" "}
                      · {new Date(wf.supervisorApprovedAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-slate-600">No supervisor approval recorded.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {wf.status === "DRAFT" && (
            <Card>
              <CardHeader>
                <CardTitle>Worker signature</CardTitle>
                <CardDescription>
                  Required before submit for JHA / FLHA / SIF / HECA / Energy Wheel /
                  Inspection (and legacy JOB_SAFETY_ANALYSIS). Uses POST{" "}
                  <code className="text-xs">/sign-worker</code> with actor headers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sign-text">Attestation</Label>
                  <Textarea
                    id="sign-text"
                    value={signText}
                    onChange={(e) => setSignText(e.target.value)}
                    placeholder="I confirm I have reviewed the hazards and controls…"
                    disabled={busy}
                    className="min-h-[88px]"
                  />
                </div>
                <Button
                  type="button"
                  disabled={busy || signText.trim().length < 3}
                  onClick={() => void runWorkerSign()}
                >
                  {busy ? "Signing…" : "Sign as worker"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Transitions</CardTitle>
              <CardDescription>
                <code className="text-xs">start_review</code>,{" "}
                <code className="text-xs">approve</code>, and{" "}
                <code className="text-xs">reject</code> require{" "}
                <strong>SUPERVISOR</strong> or <strong>ADMIN</strong>.{" "}
                <strong>PROJECT_MANAGER</strong> may submit / revise / close /
                cancel per server policy. Submit may require worker signature for
                the listed kinds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="note">Transition / approval note (optional)</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reviewer comment or supervisor attestation…"
                  disabled={busy}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {state.availableActions.map((a) => (
                  <Button
                    key={a.action}
                    type="button"
                    variant={
                      a.action === "cancel" || a.action === "reject"
                        ? "destructive"
                        : "default"
                    }
                    disabled={busy}
                    onClick={() => void runTransition(a.action)}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>PDF export</CardTitle>
                <CardDescription>
                  Downloads a minimal PDF from the API and records an audit event.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void runPdfExport()}
              >
                Download PDF
              </Button>
            </CardHeader>
            {pdfDownloaded && (
              <CardContent>
                <p className="text-sm text-slate-600">
                  Download started. Refresh events below to see{" "}
                  <code className="text-xs">PDF_EXPORT</code>.
                </p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events & notifications</CardTitle>
              <CardDescription>
                Status changes, worker signature, stub emails, PDF export audit
                entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="border-b border-slate-100 pb-3 last:border-0"
                  >
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-800">
                        {ev.eventType}
                      </span>
                      {ev.channel && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5">
                          {ev.channel}
                        </span>
                      )}
                      <span>{new Date(ev.createdAt).toLocaleString()}</span>
                    </div>
                    {ev.payload != null && (
                      <pre className="mt-1 max-h-32 overflow-auto text-xs text-slate-600">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
