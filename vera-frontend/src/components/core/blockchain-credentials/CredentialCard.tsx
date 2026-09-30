"use client";

import { QRCodeSVG } from "qrcode.react";
import type { BlockchainCredential } from "./types";

function formatDate(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "N/A";

  if (typeof value === "number") {
    const date = new Date(value > 10_000_000_000 ? value : value * 1000);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  }

  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && value.trim() !== "") {
    const date = new Date(asNumber > 10_000_000_000 ? asNumber : asNumber * 1000);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

function getDateSummary(credential: BlockchainCredential): string {
  const issue = credential.issueDate ?? credential.lastInspectionDate;
  const expiry = credential.expiryDate ?? credential.nextDueDate;
  return `${formatDate(issue)} - ${formatDate(expiry)}`;
}

function statusClasses(status: string): string {
  const key = status.toUpperCase();
  if (key === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (key === "EXPIRED") return "bg-amber-100 text-amber-700";
  if (key === "REVOKED") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export function CredentialCard({ credential }: { credential: BlockchainCredential }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">{credential.type}</h4>
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-700">Dates:</span> {getDateSummary(credential)}
          </p>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses(
              credential.status
            )}`}
          >
            {credential.status}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={credential.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            View on chain
          </a>
          <QRCodeSVG value={credential.explorerUrl} size={72} includeMargin />
        </div>
      </div>
    </article>
  );
}
