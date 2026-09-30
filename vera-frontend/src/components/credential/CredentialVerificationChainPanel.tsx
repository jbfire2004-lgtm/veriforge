"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  fetchCredentialVerificationChain,
  type CredentialLedgerEvent,
  type CredentialLifecycleStatus,
  type VerificationChain,
} from "@/lib/credential-ledger";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Badge } from "@/components/ui";

const STATUS_LABEL: Record<CredentialLifecycleStatus, string> = {
  valid: "Valid",
  expired: "Expired",
  revoked: "Revoked",
  needs_review: "Needs review",
  pending: "Pending verification",
};

const STATUS_VARIANT: Record<
  CredentialLifecycleStatus,
  "success" | "warning" | "danger" | "default"
> = {
  valid: "success",
  expired: "warning",
  revoked: "danger",
  needs_review: "warning",
  pending: "default",
};

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Credential created",
  IMPORTED: "Imported from document",
  UPDATED: "Record updated",
  CORRECTED: "Corrected by supervisor",
  VERIFIED: "Verified",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function actorLabel(event: CredentialLedgerEvent): string {
  if (event.actorType === "SYSTEM") return "System";
  if (event.actorType === "PROVIDER") return "Provider";
  if (event.actorType === "SUPERVISOR") return "Supervisor";
  if (event.actorType === "WORKER") return "Worker";
  if (event.actorType === "ADMIN") return "Admin";
  return event.actorType;
}

function LedgerEventRow({ event }: { event: CredentialLedgerEvent }) {
  return (
    <li className="relative pl-6 pb-5 last:pb-0">
      <span
        className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[#247A78] ring-4 ring-[#247A78]/15"
        aria-hidden
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#2A2E33]">
            {EVENT_LABEL[event.eventType] ?? event.eventType}
          </p>
          <p className="text-xs text-slate-500">
            {formatWhen(event.occurredAt)} · {actorLabel(event)}
            {event.actorId != null ? ` #${event.actorId}` : ""}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
          {event.eventType}
        </Badge>
      </div>
      {Object.keys(event.payload).length > 0 ? (
        <details className="mt-2 text-xs text-slate-600">
          <summary className="cursor-pointer text-slate-500">Details</summary>
          <pre className="mt-1 max-h-24 overflow-auto rounded bg-slate-50 p-2">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </details>
      ) : null}
    </li>
  );
}

export type CredentialVerificationChainPanelProps = {
  credentialId: number;
  className?: string;
};

export function CredentialVerificationChainPanel({
  credentialId,
  className,
}: CredentialVerificationChainPanelProps) {
  const [chain, setChain] = useState<VerificationChain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setChain(await fetchCredentialVerificationChain(credentialId));
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [credentialId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className ?? ""}`}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading verification chain…
      </div>
    );
  }

  if (error) {
    return (
      <CoreAlert variant="error" className={className}>
        {error}
      </CoreAlert>
    );
  }

  if (!chain) return null;

  return (
    <section
      className={`rounded-2xl border border-[#2A2E33]/10 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#247A78]" aria-hidden />
          <h2 className="text-base font-semibold text-[#2A2E33]">Verification chain</h2>
        </div>
        <Badge variant={STATUS_VARIANT[chain.status]}>
          {STATUS_LABEL[chain.status]}
        </Badge>
      </div>

      {chain.certification ? (
        <p className="mb-3 text-sm text-slate-600">
          {chain.certification.name}
          {chain.certificateNumber ? (
            <span className="ml-2 font-mono text-xs">#{chain.certificateNumber}</span>
          ) : null}
        </p>
      ) : null}

      {chain.events.length === 0 ? (
        <p className="text-sm text-slate-500">No ledger events recorded yet.</p>
      ) : (
        <ol className="border-l border-slate-200 ml-1 space-y-0">
          {chain.events.map((event) => (
            <LedgerEventRow key={event.id} event={event} />
          ))}
        </ol>
      )}
    </section>
  );
}
