"use client";

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Plus,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CAIL_SOURCE_LABELS,
  fetchCailEntries,
  type CailEntrySummary,
} from "@/lib/safety-intelligence";
import type { CailStatus } from "@/lib/safety-intelligence-types";
import { CailStatusBadge } from "@/src/components/safety-intelligence/CailStatusBadge";
import {
  SfButton,
  SfCard,
  SfFilterPills,
  SfFloatingInput,
} from "@/src/components/safety-forms/ui";

const STATUS_PILLS: Array<{ id: string; label: string }> = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In progress" },
  { id: "overdue", label: "Overdue" },
  { id: "resolved", label: "Resolved" },
  { id: "verified", label: "Verified" },
];

export default function CailListPage() {
  const [entries, setEntries] = useState<CailEntrySummary[]>([]);
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedProjectId = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCailEntries({
        projectId: parsedProjectId,
        status: status === "all" ? undefined : (status as CailStatus),
      });
      setEntries(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load CAIL");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status, parsedProjectId]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <header className="sf-animate-in relative overflow-hidden rounded-[var(--sf-radius-xl)] border border-[var(--sf-border)] bg-[var(--sf-gradient-header)] p-8 shadow-[var(--sf-shadow-lg)]">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <section>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--sf-primary)]">
              <ShieldAlert className="h-4 w-4" />
              Vera Safety Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--sf-text)]">
              Corrective Action Log (CAIL)
            </h1>
            <p className="mt-2 max-w-lg text-sm text-[var(--sf-text-muted)]">
              Closed-loop safety intelligence — walk-arounds, BBO, equipment,
              incidents, and forms all feed the CAIL.
            </p>
          </section>
          <nav className="flex flex-wrap gap-2">
            <Link href="/pm/safety-intelligence/inspections">
              <SfButton variant="secondary" type="button">
                <ClipboardCheck className="h-4 w-4" />
                Inspections
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/bbo">
              <SfButton variant="secondary" type="button">
                <Eye className="h-4 w-4" />
                BBO
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/lessons">
              <SfButton variant="secondary" type="button">
                <BookOpen className="h-4 w-4" />
                Lessons
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/incidents">
              <SfButton variant="secondary" type="button">
                <AlertTriangle className="h-4 w-4" />
                Incidents
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/dashboard">
              <SfButton variant="secondary" type="button">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/settings/roles">
              <SfButton variant="secondary" type="button">
                <Settings className="h-4 w-4" />
                Roles
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/settings/copilot">
              <SfButton variant="secondary" type="button">
                <Sparkles className="h-4 w-4" />
                Copilot
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence/new">
              <SfButton type="button">
                <Plus className="h-4 w-4" />
                New entry
              </SfButton>
            </Link>
          </nav>
        </div>
      </header>

      <SfCard className="space-y-4 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="max-w-[140px]"
          />
          <SfFilterPills
            pills={STATUS_PILLS}
            value={status}
            onChange={setStatus}
          />
        </div>
      </SfCard>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
      ) : entries.length === 0 ? (
        <SfCard className="p-8 text-center text-sm text-[var(--sf-text-muted)]">
          No CAIL entries yet. Create one or connect a source in a later phase.
        </SfCard>
      ) : (
        <ul className="space-y-3">
          {entries.map((row) => (
            <li key={row.id}>
              <Link href={`/pm/safety-intelligence/${row.id}`}>
                <SfCard className="group flex items-center justify-between gap-4 p-5 transition hover:border-[var(--sf-primary)]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CailStatusBadge status={row.status} />
                      <span className="text-xs uppercase text-[var(--sf-text-muted)]">
                        {CAIL_SOURCE_LABELS[row.sourceType] ?? row.sourceType}
                      </span>
                    </div>
                    <h2 className="mt-1 truncate font-medium text-[var(--sf-text)]">
                      {row.title}
                    </h2>
                    <p className="text-xs text-[var(--sf-text-muted)]">
                      {row.project?.name ?? `Project ${row.projectId}`}
                      {row.ownerCompany?.name
                        ? ` · ${row.ownerCompany.name}`
                        : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--sf-text-muted)] transition group-hover:text-[var(--sf-primary)]" />
                </SfCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
