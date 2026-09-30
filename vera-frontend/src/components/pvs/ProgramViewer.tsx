"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import {
  clearPvsExemption,
  decidePvsExemption,
  getPvsProgram,
  submitPvsProgram,
  updatePvsMatrix,
  updatePvsProgram,
  verifyPvsProgram,
  type PvsElementStatus,
  type ProgramVerification,
} from "@/lib/pvs-api";
import { PvsStatusBadge } from "./PvsStatusBadge";
import { PvsExemptionModal } from "./PvsExemptionModal";

export function ProgramViewer({
  contractorId,
  pvsId,
  canManage = true,
  onChanged,
}: {
  contractorId: string;
  pvsId: string;
  canManage?: boolean;
  onChanged?: () => void;
}) {
  const [program, setProgram] = useState<ProgramVerification | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exemptOpen, setExemptOpen] = useState(false);

  async function reload() {
    setError(null);
    try {
      const p = await getPvsProgram(contractorId, pvsId);
      setProgram(p);
      setBody(p.programBody || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    void reload();
  }, [contractorId, pvsId]);

  async function saveBody() {
    setBusy(true);
    try {
      await updatePvsProgram(contractorId, pvsId, { programBody: body });
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function setElementStatus(key: string, status: PvsElementStatus) {
    setBusy(true);
    try {
      await updatePvsMatrix(contractorId, pvsId, [
        { elementKey: key, status },
      ]);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Matrix update failed");
    } finally {
      setBusy(false);
    }
  }

  if (!program) {
    return <p className="text-sm text-zinc-500">{error || "Loading…"}</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{program.title}</h3>
          <p className="text-sm capitalize text-zinc-600">
            {program.programCategory.replace(/_/g, " ")}
          </p>
          <div className="flex flex-wrap gap-2">
            <PvsStatusBadge status={program.verificationStatus} />
            {program.exemptionFlag ? (
              <span className="border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-800">
                Exemption: {program.exemptionApprovalStatus}
              </span>
            ) : null}
          </div>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void saveBody()}
            >
              Save program
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void submitPvsProgram(contractorId, pvsId)
                  .then(reload)
                  .then(() => onChanged?.())
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Submit failed"),
                  )
              }
            >
              Submit for review
            </Button>
            {!program.exemptionFlag ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setExemptOpen(true)}
              >
                Request exemption
              </Button>
            ) : null}
            {program.exemptionApprovalStatus === "pending" ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void decidePvsExemption(contractorId, pvsId, "approved")
                      .then(reload)
                      .then(() => onChanged?.())
                  }
                >
                  Approve exemption
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void decidePvsExemption(contractorId, pvsId, "rejected")
                      .then(reload)
                      .then(() => onChanged?.())
                  }
                >
                  Reject exemption
                </Button>
              </>
            ) : null}
            {program.exemptionFlag ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void clearPvsExemption(contractorId, pvsId)
                    .then(reload)
                    .then(() => onChanged?.())
                }
              >
                Clear exemption
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={busy}
              onClick={() =>
                void verifyPvsProgram(contractorId, pvsId, {
                  decision: "verified",
                })
                  .then(reload)
                  .then(() => onChanged?.())
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Verify failed"),
                  )
              }
            >
              Mark verified
            </Button>
          </div>
        ) : null}
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="space-y-2">
        <h4 className="text-sm font-medium uppercase text-zinc-500">
          Written program
        </h4>
        <textarea
          className="min-h-[160px] w-full border border-zinc-300 px-3 py-2 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={!canManage}
          placeholder="Paste or summarize the written safety program…"
        />
        {program.fileUrl ? (
          <a
            href={program.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sky-700 underline"
          >
            Open attached file
          </a>
        ) : null}
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-medium uppercase text-zinc-500">
          Safety matrix
        </h4>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {(program.elements || []).map((el) => (
            <li
              key={el.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
            >
              <div>
                <div className="font-medium">
                  {el.elementLabel}
                  {el.required ? " *" : ""}
                </div>
                <div className="text-xs capitalize text-zinc-500">
                  {el.status}
                </div>
              </div>
              {canManage ? (
                <div className="flex gap-1">
                  {(["verified", "missing", "exempt", "na", "pending"] as PvsElementStatus[]).map(
                    (s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={el.status === s ? "default" : "outline"}
                        disabled={busy}
                        onClick={() => void setElementStatus(el.elementKey, s)}
                      >
                        {s}
                      </Button>
                    ),
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <PvsExemptionModal
        contractorId={contractorId}
        pvsId={pvsId}
        title={program.title}
        open={exemptOpen}
        onClose={() => setExemptOpen(false)}
        onDone={() => {
          void reload();
          onChanged?.();
        }}
      />
    </div>
  );
}
