"use client";

import { useState } from "react";
import {
  recordCustodyTransfer,
  type CustodyTransfer,
  type SubstanceTestEvent,
} from "@/lib/pm-substance-testing";
import { SignaturePad } from "./SignaturePad";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

const ROLES = [
  "donor",
  "collector",
  "courier",
  "lab_technician",
  "mro",
  "der",
  "safety_officer",
  "hr",
] as const;

type Props = {
  test: SubstanceTestEvent;
  onUpdate: () => void;
};

export function ChainOfCustodyPanel({ test, onUpdate }: Props) {
  const [fromRole, setFromRole] = useState("collector");
  const [toRole, setToRole] = useState("courier");
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!signatureData || !signerName.trim()) return;
    setBusy(true);
    try {
      await recordCustodyTransfer(test.id, {
        fromRole,
        toRole,
        fromPartyName: fromName || undefined,
        toPartyName: toName || undefined,
        locationNote: locationNote || undefined,
        signature: {
          signerName,
          signerRole: toRole,
          signatureData,
        },
      });
      setSignatureData("");
      onUpdate();
    } finally {
      setBusy(false);
    }
  }

  const transfers = test.custodyTransfers ?? [];

  return (
    <div className="space-y-6">
      <WorkspaceSection
        title="Chain of custody"
        description="Timestamped transfers with digital signatures. Each handoff is immutably recorded."
      >
        {transfers.length ? (
          <ol className="relative border-l border-[#2A2E33]/10 pl-6 space-y-4">
            {transfers.map((t: CustodyTransfer) => (
              <li key={t.id} className="relative">
                <span className="absolute -left-[1.6rem] flex h-5 w-5 items-center justify-center rounded-full bg-[#2F8F8C] text-[10px] font-bold text-white">
                  {t.sequenceNumber}
                </span>
                <div className="rounded-xl border border-[#2A2E33]/10 bg-white p-4 text-sm">
                  <p className="font-medium text-[#2A2E33]">
                    {t.fromRole.replace(/_/g, " ")} → {t.toRole.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {new Date(t.transferredAt).toLocaleString()}
                    {t.locationNote ? ` · ${t.locationNote}` : ""}
                  </p>
                  {t.fromPartyName || t.toPartyName ? (
                    <p className="mt-1 text-xs">
                      {t.fromPartyName} → {t.toPartyName}
                    </p>
                  ) : null}
                  {t.signature ? (
                    <p className="mt-1 text-xs text-[#2F8F8C]">
                      Signed by {t.signature.signerName}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[#64748b]">No custody transfers recorded yet.</p>
        )}
      </WorkspaceSection>

      <WorkspaceSection title="Record transfer" description="Signature required for each handoff">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-[#64748b]">From role</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
              value={fromRole}
              onChange={(e) => setFromRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748b]">To role</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
              value={toRole}
              onChange={(e) => setToRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <input
            className="rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="From party name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          />
          <input
            className="rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="To party name"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
          />
          <input
            className="sm:col-span-2 rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="Location"
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
          />
          <input
            className="sm:col-span-2 rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm"
            placeholder="Signer full name"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <SignaturePad
            label="Digital signature (required)"
            onSign={(data) => setSignatureData(data)}
          />
          {signatureData ? (
            <p className="mt-1 text-xs text-[#2F8F8C]">Signature captured</p>
          ) : null}
        </div>

        <Button
          type="button"
          size="sm"
          className="mt-4"
          disabled={busy || !signatureData || !signerName.trim()}
          onClick={() => void submit()}
        >
          {busy ? "Recording…" : "Record custody transfer"}
        </Button>
      </WorkspaceSection>
    </div>
  );
}
