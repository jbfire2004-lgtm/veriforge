"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { sfCn } from "../theme/cn";
import { SfBadge } from "./SfBadge";

type Props = {
  title: string;
  subtitle?: string;
  status?: string;
  saving?: boolean;
  saved?: boolean;
  flags?: { sif?: boolean; heca?: boolean };
};

export function SfFormHeader({
  title,
  subtitle,
  status,
  saving,
  saved,
  flags,
}: Props) {
  return (
    <header className="sf-glass sticky top-0 z-20 -mx-1 mb-6 rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)] px-5 py-4 shadow-[var(--sf-shadow-md)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <section className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--sf-primary)]">
            Vera Safety
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--sf-text)] sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-[var(--sf-text-muted)]">{subtitle}</p>
          ) : null}
          {flags?.sif || flags?.heca ? (
            <p className="mt-2 flex flex-wrap gap-2">
              {flags.sif ? <SfBadge tone="danger">SIF</SfBadge> : null}
              {flags.heca ? <SfBadge tone="warning">HECA</SfBadge> : null}
            </p>
          ) : null}
        </section>
        <aside className="flex flex-col items-end gap-2">
          {status ? <SfBadge tone="info">{status.replace(/_/g, " ")}</SfBadge> : null}
          <span
            className={sfCn(
              "flex items-center gap-1.5 text-xs text-[var(--sf-text-muted)]",
              saving && "sf-pulse-save",
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-[var(--sf-success)]" />
                Saved
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5" />
                Draft
              </>
            )}
          </span>
        </aside>
      </div>
      <div className="sf-divider mt-4 !mb-0" />
    </header>
  );
}
