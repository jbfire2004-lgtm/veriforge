"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";

import { useToast } from "@/components/ui";
import { cn } from "@/src/lib/utils";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";

import { VeriWalletDashboard, type VeriWalletQuickAction } from "./VeriWalletDashboard";
import { VeriWalletLedger } from "./VeriWalletLedger";
import { VeriWalletPermissions } from "./VeriWalletPermissions";
import { VeriWalletSecureModal } from "./VeriWalletSecureModal";
import { vwBtn, vwSurface } from "./tokens";

type SecureKind = "add-credits" | "transfer" | "verify-asset" | "revoke";
type TabId = "dashboard" | "ledger" | "permissions" | "staff";

/**
 * Preview mode until credits/ledger/permissions APIs are live.
 * Staff credentials tab remains the production path to /wallet/{id}.
 */
const VERIWALLET_PREVIEW =
  process.env.NEXT_PUBLIC_VERIWALLET_LIVE !== "true";

/**
 * VeriWallet industrial shell — credits, ledger, permissions, plus staff credential lookup.
 */
export function VeriWalletView() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = React.useState<TabId>("dashboard");
  const [secureOpen, setSecureOpen] = React.useState(false);
  const [secureKind, setSecureKind] = React.useState<SecureKind | null>(null);
  const [workerId, setWorkerId] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const trimmed = workerId.trim();

  function openSecure(kind: SecureKind) {
    setSecureKind(kind);
    setSecureOpen(true);
  }

  function onAction(action: VeriWalletQuickAction) {
    if (action === "view-ledger") {
      setTab("ledger");
      return;
    }
    openSecure(action);
  }

  function onSubmitStaff(event: React.FormEvent) {
    event.preventDefault();
    if (trimmed.length === 0) {
      setFieldError("Enter a worker ID to continue.");
      return;
    }
    const numeric = Number(trimmed);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      setFieldError("Worker IDs are positive integers.");
      toast.toast({
        title: "Invalid worker ID",
        description: "Try a positive whole number such as 42.",
        variant: "warning",
      });
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    router.push(`/wallet/${numeric}`);
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "ledger", label: "Ledger" },
    { id: "permissions", label: "Permissions" },
    { id: "staff", label: "Staff credentials" },
  ];

  return (
    <>
      <VeraPageHeader
        title="VeriWallet"
        description="Enterprise wallet for verification credits, identity tokens, transaction history, and permissioned actions."
      />

      {VERIWALLET_PREVIEW ? (
        <div
          role="status"
          className="mb-4 rounded-[3px] border border-[#C89F3D]/50 bg-[#2A2820] px-4 py-3 text-sm text-[#F2E8C8]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C89F3D]">
            Preview · Demo data
          </p>
          <p className="mt-1 leading-relaxed">
            Credits, ledger, and permissions are UI previews and are not
            persisted. Secure actions will not write to a live ledger. Use{" "}
            <strong className="font-semibold text-[#F4F6F8]">
              Staff credentials
            </strong>{" "}
            for production worker wallets, or set{" "}
            <span className="font-mono text-xs">NEXT_PUBLIC_VERIWALLET_LIVE=true</span>{" "}
            when APIs are connected.
          </p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-[#2A2E33]/12 pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-[3px] border border-b-0 px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]",
              tab === t.id
                ? "border-[#2A2E33]/14 bg-white text-[#1E6FB8]"
                : "border-transparent text-[#5A6169] hover:bg-[#E8ECF0] hover:text-[#2A2E33]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? (
        <VeriWalletDashboard onAction={onAction} />
      ) : null}

      {tab === "ledger" ? <VeriWalletLedger /> : null}

      {tab === "permissions" ? (
        <VeriWalletPermissions onRevoke={() => openSecure("revoke")} />
      ) : null}

      {tab === "staff" ? (
        <section className={cn(vwSurface.panel, "p-5")}>
          <header className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
              Staff credential wallet
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
              Open a worker credential hub
            </h3>
            <p className="mt-1 text-sm text-[#5A6169]">
              Credentials, training records, expiries, and verification history
              for authenticated staff. Public QR verification uses{" "}
              <span className="font-mono text-xs">/verify/&#123;id&#125;</span>.
            </p>
          </header>

          <form
            onSubmit={onSubmitStaff}
            className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
            noValidate
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <label
                htmlFor="wallet-worker-id"
                className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5A6169]"
              >
                Worker ID
              </label>
              <input
                id="wallet-worker-id"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 42"
                value={workerId}
                onChange={(event) => {
                  setWorkerId(event.target.value);
                  if (fieldError) setFieldError(null);
                }}
                aria-invalid={fieldError != null}
                aria-describedby={
                  fieldError != null ? "wallet-worker-id-error" : undefined
                }
                className={cn(
                  "h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 text-sm text-[#2A2E33]",
                  "placeholder:text-[#8A929A]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]",
                )}
              />
              {fieldError != null ? (
                <p
                  id="wallet-worker-id-error"
                  className="text-sm font-medium text-[#C89F3D]"
                  role="alert"
                >
                  {fieldError}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={submitting || trimmed.length === 0}
              className={cn(vwBtn.base, vwBtn.primary, "h-10 shrink-0 px-4")}
            >
              {submitting ? "Opening…" : "Open wallet"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/qr"
              className={cn(vwBtn.base, vwBtn.ghost, "h-9 px-3 text-sm")}
            >
              <ScanLine className="h-4 w-4" aria-hidden />
              Use the QR scanner
            </Link>
            {trimmed && /^\d+$/.test(trimmed) ? (
              <Link
                href={`/verify/${trimmed}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(vwBtn.base, vwBtn.secondary, "h-9 px-3 text-sm")}
              >
                Public verify link
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <VeriWalletSecureModal
        open={secureOpen}
        kind={secureKind}
        preview={VERIWALLET_PREVIEW}
        onClose={() => {
          setSecureOpen(false);
          setSecureKind(null);
        }}
        onConfirm={(kind) => {
          if (VERIWALLET_PREVIEW) {
            toast.toast({
              title: "Preview only — not persisted",
              description: `${kind} was simulated. Connect VeriWallet APIs before production use.`,
              variant: "warning",
            });
            return;
          }
          toast.toast({
            title: "Action recorded",
            description: `${kind} submitted to the audit ledger.`,
            variant: "success",
          });
        }}
      />
    </>
  );
}
