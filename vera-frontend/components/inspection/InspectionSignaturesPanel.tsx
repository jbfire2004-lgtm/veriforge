"use client";

import { useMemo, useState } from "react";
import { InspectionSignaturePad } from "@/components/inspection/InspectionSignaturePad";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { addPmInspectionSignature, type PmInspection } from "@/lib/pm-inspections";
import { uploadInspectionSignaturePng } from "@/lib/inspection-signature-upload";
import {
  isSupervisorSignatureRole,
  isWorkerSignatureRole,
  signaturePreviewUrl,
  type RequiredSignatureDef,
} from "@/lib/inspection-signatures";

function SignatureBlock({
  title,
  requirements,
  inspection,
  editable,
  existingRoles,
  pads,
  names,
  busy,
  onNameChange,
  onPadChange,
  onSave,
}: {
  title: string;
  requirements: RequiredSignatureDef[];
  inspection: PmInspection;
  editable: boolean;
  existingRoles: Set<string>;
  pads: Record<string, string | undefined>;
  names: Record<string, string>;
  busy: string | null;
  onNameChange: (role: string, name: string) => void;
  onPadChange: (role: string, value: string | undefined) => void;
  onSave: (role: string) => void;
}) {
  if (!requirements.length) return null;

  const saved = requirements.filter((r) => existingRoles.has(r.role));
  const missing = requirements.filter((r) => !existingRoles.has(r.role));

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
        {title}
      </h3>
      {saved.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {saved.map((req) => {
            const row = inspection.signatures.find((s) => s.role === req.role);
            const preview = row ? signaturePreviewUrl(row) : null;
            return (
              <li
                key={req.role}
                className="rounded border border-emerald-200 bg-emerald-50/40 p-3 text-sm"
              >
                <p className="font-medium text-emerald-900">
                  {req.label ?? req.role} ✓
                </p>
                {row?.signerName ? (
                  <p className="text-xs text-emerald-800">{row.signerName}</p>
                ) : null}
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={`${req.label ?? req.role} signature`}
                    className="mt-2 max-h-20 rounded border bg-white object-contain"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {editable
        ? missing.map((req) => (
            <div key={req.role} className="space-y-2 rounded border p-3">
              <p className="text-sm font-medium">
                {req.label ?? req.role}
                <span className="text-[var(--sf-danger)]"> *</span>
              </p>
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="Signer name (optional)"
                value={names[req.role] ?? ""}
                onChange={(e) => onNameChange(req.role, e.target.value)}
              />
              <InspectionSignaturePad
                label={`Sign as ${req.label ?? req.role}`}
                value={pads[req.role]}
                onChange={(v) => onPadChange(req.role, v)}
                required
              />
              <SfButton
                type="button"
                variant="secondary"
                disabled={busy === req.role}
                onClick={() => onSave(req.role)}
              >
                {busy === req.role ? "Uploading…" : "Save signature"}
              </SfButton>
            </div>
          ))
        : null}
    </section>
  );
}

export function InspectionSignaturesPanel({
  inspection,
  editable,
  onSigned,
}: {
  inspection: PmInspection;
  editable: boolean;
  onSigned: () => void;
}) {
  const required = (inspection.template.requiredSignatures ??
    []) as RequiredSignatureDef[];
  const existingRoles = useMemo(
    () => new Set(inspection.signatures.map((s) => s.role)),
    [inspection.signatures],
  );

  const supervisorReqs = useMemo(
    () => required.filter((r) => isSupervisorSignatureRole(r.role)),
    [required],
  );
  const workerReqs = useMemo(
    () =>
      required.filter(
        (r) => isWorkerSignatureRole(r.role) && !isSupervisorSignatureRole(r.role),
      ),
    [required],
  );
  const otherReqs = useMemo(
    () =>
      required.filter(
        (r) =>
          !isSupervisorSignatureRole(r.role) && !isWorkerSignatureRole(r.role),
      ),
    [required],
  );

  const [pads, setPads] = useState<Record<string, string | undefined>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!required.length && !inspection.signatures.length) {
    return null;
  }

  async function saveRole(role: string) {
    const dataUrl = pads[role];
    if (!dataUrl) {
      setError(`Draw a signature for ${role}`);
      return;
    }
    setBusy(role);
    setError(null);
    try {
      const uploaded = await uploadInspectionSignaturePng(dataUrl, {
        role,
        inspectionId: inspection.id,
      });
      await addPmInspectionSignature(inspection.id, {
        role,
        signatureData: uploaded.signatureUrl,
        coreFileId: uploaded.coreFileId,
        signerName: names[role]?.trim() || undefined,
      });
      setPads((p) => ({ ...p, [role]: undefined }));
      onSigned();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signature failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SfCard className="space-y-6 p-5">
      <div>
        <h2 className="font-medium">Signatures</h2>
        <p className="text-xs text-[var(--sf-text-muted)]">
          Draw on the pad — saved as PNG upload. Submit is blocked until all required
          signatures are recorded.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <SignatureBlock
        title="Supervisor"
        requirements={supervisorReqs}
        inspection={inspection}
        editable={editable}
        existingRoles={existingRoles}
        pads={pads}
        names={names}
        busy={busy}
        onNameChange={(role, name) => setNames((n) => ({ ...n, [role]: name }))}
        onPadChange={(role, value) => setPads((p) => ({ ...p, [role]: value }))}
        onSave={(role) => void saveRole(role)}
      />

      <SignatureBlock
        title="Worker"
        requirements={workerReqs}
        inspection={inspection}
        editable={editable}
        existingRoles={existingRoles}
        pads={pads}
        names={names}
        busy={busy}
        onNameChange={(role, name) => setNames((n) => ({ ...n, [role]: name }))}
        onPadChange={(role, value) => setPads((p) => ({ ...p, [role]: value }))}
        onSave={(role) => void saveRole(role)}
      />

      <SignatureBlock
        title="Other"
        requirements={otherReqs}
        inspection={inspection}
        editable={editable}
        existingRoles={existingRoles}
        pads={pads}
        names={names}
        busy={busy}
        onNameChange={(role, name) => setNames((n) => ({ ...n, [role]: name }))}
        onPadChange={(role, value) => setPads((p) => ({ ...p, [role]: value }))}
        onSave={(role) => void saveRole(role)}
      />

      {editable && required.some((r) => !existingRoles.has(r.role)) ? (
        <p className="text-xs text-amber-700">
          All required signatures must be saved before submit.
        </p>
      ) : null}
    </SfCard>
  );
}
