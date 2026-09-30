"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { vwBtn, vwSurface } from "./tokens";
import { VwLockIcon } from "./icons";

type SecureActionKind = "add-credits" | "transfer" | "verify-asset" | "revoke";

const ACTION_COPY: Record<
  SecureActionKind,
  { title: string; description: string; confirmLabel: string; warning?: string }
> = {
  "add-credits": {
    title: "Add verification credits",
    description:
      "Credits are applied to this wallet for verification and inspection workflows. This action is logged to the ledger.",
    confirmLabel: "Add credits",
  },
  transfer: {
    title: "Transfer credits",
    description:
      "Transfer verification credits to another permissioned wallet. Both parties receive an audit entry.",
    confirmLabel: "Transfer",
    warning: "Transfers cannot be reversed without supervisor approval.",
  },
  "verify-asset": {
    title: "Verify asset",
    description:
      "Consume one verification credit to attest asset compliance. Evidence is written to the ledger.",
    confirmLabel: "Verify asset",
  },
  revoke: {
    title: "Revoke permission",
    description:
      "Immediately revoke the selected permission. The subject loses access on next session refresh.",
    confirmLabel: "Confirm revocation",
    warning: "This is a security-sensitive action. Ensure authorization is documented.",
  },
};

/**
 * Secure action modal — slate surface, two-step confirmation.
 * Primary = safety blue · Secondary = graphite · Warnings = muted amber.
 * Never uses red buttons.
 */
export function VeriWalletSecureModal({
  open,
  kind,
  onClose,
  onConfirm,
  preview = false,
}: {
  open: boolean;
  kind: SecureActionKind | null;
  onClose: () => void;
  onConfirm: (kind: SecureActionKind) => void;
  /** When true, actions are UI-only and must not claim ledger persistence */
  preview?: boolean;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [ack, setAck] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setAck(false);
    }
  }, [open, kind]);

  if (!open || !kind) return null;

  const copy = ACTION_COPY[kind];

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#1C1F24]/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vw-secure-title"
        className={cn(vwSurface.slate, "w-full max-w-lg p-5")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start gap-3 border-b border-[#5A6169] pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-[3px] border border-[#5A6169] bg-[#23272C] text-[#1E6FB8]">
            <VwLockIcon size={18} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
              Secure action · Step {step} of 2
              {preview ? " · Preview" : ""}
            </p>
            <h2
              id="vw-secure-title"
              className="mt-1 text-base font-semibold text-[#F4F6F8]"
            >
              {copy.title}
            </h2>
          </div>
        </header>

        {preview ? (
          <div className="mb-4 rounded-[3px] border border-[#C89F3D]/50 bg-[#2A2820] px-3 py-2.5 text-sm text-[#F2E8C8]">
            Preview mode — this confirmation will not persist credits, transfers,
            or permission changes until VeriWallet APIs are connected.
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[#D5DBE0]">
              {copy.description}
            </p>
            {copy.warning ? (
              <div className="rounded-[3px] border border-[#C89F3D]/50 bg-[#2A2820] px-3 py-2.5 text-sm text-[#F2E8C8]">
                {copy.warning}
              </div>
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#D5DBE0]">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-[3px] border border-[#5A6169] accent-[#1E6FB8]"
              />
              <span>
                {preview
                  ? "I understand this is a preview and no ledger write will occur."
                  : "I confirm this action is authorized and will be recorded in the audit ledger."}
              </span>
            </label>
            <footer className="flex justify-end gap-2 pt-2">
              <button type="button" className={cn(vwBtn.base, vwBtn.ghost, "border-[#5A6169] text-[#F4F6F8] hover:bg-[#3B3F45]")} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                disabled={!ack}
                className={cn(vwBtn.base, vwBtn.primary)}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </footer>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-[#D5DBE0]">
              Final confirmation required. Select{" "}
              <strong className="font-semibold text-[#F4F6F8]">
                {preview ? `Simulate ${copy.confirmLabel}` : copy.confirmLabel}
              </strong>{" "}
              to {preview ? "close the preview" : "execute"}, or cancel to abort
              without changes.
            </p>
            <div className="rounded-[3px] border border-[#5A6169] bg-[#23272C] px-3 py-2.5 text-xs text-[#A8B0B8]">
              Action type: <span className="text-[#F4F6F8]">{kind}</span> ·
              {preview ? " Preview only" : " Timestamp will be UTC ISO-8601"}
            </div>
            <footer className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className={cn(vwBtn.base, vwBtn.secondary)}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className={cn(vwBtn.base, vwBtn.primary)}
                onClick={() => {
                  onConfirm(kind);
                  onClose();
                }}
              >
                {preview ? `Simulate ${copy.confirmLabel}` : copy.confirmLabel}
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
