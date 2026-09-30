"use client";

import { BarChart3, ChevronRight, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchSafetyFormDefinitions,
  fetchSafetyForms,
  type SafetyFormSummary,
} from "@/lib/safety-forms";
import {
  SAFETY_FORM_CATEGORIES,
  SAFETY_FORM_CATEGORY_LABELS,
} from "@/src/components/safety-forms/engine/types";
import { SafetyFormStatusBadge } from "@/src/components/safety-forms/SafetyFormStatusBadge";
import {
  SfButton,
  SfCard,
  SfFilterPills,
  SfFloatingInput,
} from "@/src/components/safety-forms/ui";

export default function SafetyFormsListPage() {
  const [definitions, setDefinitions] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);
  const [submissions, setSubmissions] = useState<SafetyFormSummary[]>([]);
  const [category, setCategory] = useState("all");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedCompanyId = useMemo(() => {
    const n = Number(companyId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [companyId]);

  const pills = useMemo(
    () => [
      { id: "all", label: "All" },
      ...SAFETY_FORM_CATEGORIES.map((c) => ({
        id: c,
        label: SAFETY_FORM_CATEGORY_LABELS[c] ?? c,
      })),
    ],
    [],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [defs, rows] = await Promise.all([
        fetchSafetyFormDefinitions(category === "all" ? undefined : category),
        fetchSafetyForms({ companyId: parsedCompanyId }),
      ]);
      setDefinitions(defs);
      setSubmissions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [category, parsedCompanyId]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof definitions>();
    for (const d of definitions) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return map;
  }, [definitions]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <header className="sf-animate-in relative overflow-hidden rounded-[var(--sf-radius-xl)] border border-[var(--sf-border)] bg-[var(--sf-gradient-header)] p-8 shadow-[var(--sf-shadow-lg)]">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <section>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--sf-primary)]">
              <Sparkles className="h-4 w-4" />
              VeraPM Safety
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--sf-text)]">
              Safety Forms
            </h1>
            <p className="mt-2 max-w-lg text-sm text-[var(--sf-text-muted)]">
              One unified platform for all 25 safety forms — permits, FLHAs,
              inspections, and intelligence reporting.
            </p>
          </section>
          <nav className="flex flex-wrap gap-2">
            <Link href="/pm/safety-forms/dashboard">
              <SfButton variant="secondary" type="button">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </SfButton>
            </Link>
            <Link href="/pm/safety-intelligence">
              <SfButton variant="secondary" type="button">
                <Shield className="h-4 w-4" />
                CAIL / VSI
              </SfButton>
            </Link>
            <Link href="/pm/safety">
              <SfButton variant="ghost" type="button">
                Legacy workflows
              </SfButton>
            </Link>
          </nav>
        </div>
      </header>

      <section className="space-y-4">
        <SfFilterPills pills={pills} value={category} onChange={setCategory} />
        <SfFloatingInput
          label="Company ID filter"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />
        <SfButton variant="secondary" size="sm" type="button" onClick={() => void load()} disabled={loading}>
          Refresh
        </SfButton>
      </section>

      {error ? (
        <p className="text-sm text-[var(--sf-danger)]">{error}</p>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--sf-text)]">Start a form</h2>
        {loading ? (
          <p className="text-sm text-[var(--sf-text-muted)]">Loading catalog…</p>
        ) : (
          Array.from(grouped.entries()).map(([cat, defs]) => (
            <SfCard key={cat} padding="md">
              <header className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--sf-radius-md)] bg-[var(--sf-primary-muted)] text-[var(--sf-primary)]">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-[var(--sf-text)]">
                    {SAFETY_FORM_CATEGORY_LABELS[cat] ?? cat}
                  </h3>
                  <p className="text-xs text-[var(--sf-text-muted)]">{defs.length} forms</p>
                </div>
              </header>
              <ul className="grid gap-2 sm:grid-cols-2">
                {defs.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/pm/safety-forms/fill/${d.id}`}
                      className="group flex items-center justify-between rounded-[var(--sf-radius-md)] border border-[var(--sf-border)] px-4 py-3 text-sm font-medium transition-all hover:border-[var(--sf-primary)] hover:bg-[var(--sf-primary-muted)] hover:shadow-[var(--sf-shadow-sm)]"
                    >
                      {d.name}
                      <ChevronRight className="h-4 w-4 text-[var(--sf-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--sf-primary)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </SfCard>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--sf-text)]">Recent submissions</h2>
        {submissions.length === 0 ? (
          <SfCard padding="md">
            <p className="text-sm text-[var(--sf-text-muted)]">No submissions yet.</p>
          </SfCard>
        ) : (
          <ul className="space-y-3">
            {submissions.map((row) => (
              <li key={row.id}>
                <Link href={`/pm/safety-forms/${row.id}`}>
                  <SfCard interactive padding="md" className="flex items-center justify-between gap-4">
                    <section>
                      <p className="font-medium text-[var(--sf-text)]">
                        {row.title ?? row.formDefinition?.name ?? row.definitionId}
                      </p>
                      <p className="text-xs text-[var(--sf-text-muted)]">
                        {row.formDefinition?.category}
                        {row.sifFlag ? " · SIF" : ""}
                        {row.hecaFlag ? " · HECA" : ""}
                      </p>
                    </section>
                    <SafetyFormStatusBadge status={row.status} />
                  </SfCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
