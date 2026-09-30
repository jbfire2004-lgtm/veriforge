"use client";

import { useMemo } from "react";
import { SfCard } from "@/src/components/safety-forms/ui";
import {
  type RequiredSignatureDef,
  signaturePreviewUrl,
} from "@/lib/inspection-signatures";
import type { PmInspection } from "@/lib/pm-inspections";

export function InspectionSignatureStatusBanner({
  inspection,
}: {
  inspection: PmInspection;
}) {
  const required = (inspection.template.requiredSignatures ??
    []) as RequiredSignatureDef[];

  const status = useMemo(() => {
    if (!required.length) return null;
    const signed = new Set(inspection.signatures.map((s) => s.role));
    const missing = required.filter((r) => !signed.has(r.role));
    return {
      complete: missing.length === 0,
      missing,
      required,
    };
  }, [inspection.signatures, required]);

  if (!status) return null;

  return (
    <SfCard className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Signature status</h2>
        <span
          className={
            status.complete
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
              : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
          }
        >
          {status.complete ? "Complete" : `${status.missing.length} required`}
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {status.required.map((req) => {
          const row = inspection.signatures.find((s) => s.role === req.role);
          const preview = row ? signaturePreviewUrl(row) : null;
          const done = Boolean(row);
          return (
            <li
              key={req.role}
              className="flex items-start gap-3 rounded border border-[var(--sf-border)] p-3 text-sm"
            >
              <span
                className={
                  done
                    ? "mt-0.5 text-emerald-600"
                    : "mt-0.5 text-[var(--sf-text-muted)]"
                }
                aria-hidden
              >
                {done ? "✓" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{req.label ?? req.role}</p>
                <p className="text-xs text-[var(--sf-text-muted)]">
                  {done
                    ? `${row?.signerName ?? req.role}${row?.signedAt ? ` · ${new Date(row.signedAt).toLocaleString()}` : ""}`
                    : "Required before submit"}
                </p>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt={`${req.label ?? req.role} signature`}
                    className="mt-2 max-h-16 rounded border bg-white object-contain"
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </SfCard>
  );
}
