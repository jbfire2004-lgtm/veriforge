"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createPpePreUse } from "@/lib/ppe-preuse";
import {
  PPE_PREUSE_CHECKLIST,
  computePpePreUseOverall,
  type PpePreUseItemResult,
  type PpePreUseItemSubmission,
} from "@/lib/ppe-preuse-checklist";
import { VeraPageLayout } from "@/src/components/navigation";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
} from "@/src/components/safety-forms/ui";

function defaultItems(): PpePreUseItemSubmission[] {
  return PPE_PREUSE_CHECKLIST.map((d) => ({
    id: d.id,
    result: "pass" as const,
    note: "",
  }));
}

export default function PpePreUseNewPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("1");
  const [companyId, setCompanyId] = useState("1");
  const [locationNote, setLocationNote] = useState("");
  const [taskType, setTaskType] = useState("");
  const [items, setItems] = useState<PpePreUseItemSubmission[]>(defaultItems);
  const [deficiencies, setDeficiencies] = useState("");
  const [removedFromService, setRemovedFromService] = useState(false);
  const [acknowledgedSafeToWork, setAcknowledgedSafeToWork] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overall = useMemo(() => computePpePreUseOverall(items), [items]);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof PPE_PREUSE_CHECKLIST>();
    for (const def of PPE_PREUSE_CHECKLIST) {
      const list = map.get(def.category) ?? [];
      list.push(def);
      map.set(def.category, list);
    }
    return [...map.entries()];
  }, []);

  function setResult(id: string, result: PpePreUseItemResult) {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, result } : row)),
    );
  }

  function setNote(id: string, note: string) {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, note } : row)),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const row = await createPpePreUse({
        projectId: Number(projectId),
        companyId: Number(companyId),
        locationNote: locationNote || undefined,
        taskType: taskType || undefined,
        items: items.map(({ id, result, note }) => ({
          id,
          result,
          note: note || undefined,
        })),
        deficiencies: deficiencies || undefined,
        removedFromService,
        acknowledgedSafeToWork,
      });
      router.push(`/pm/inspections/ppe-preuse/${row.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VeraPageLayout
      title="PPE pre-use inspection"
      description="Inspect your personal PPE kit before work. Failures must be removed from service. Company and project management can review submissions."
    >
      <form className="mx-auto max-w-3xl space-y-6" onSubmit={(e) => void submit(e)}>
        <SfCard className="grid gap-3 p-6 sm:grid-cols-2">
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <SfFloatingInput
            label="Company ID"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
          />
          <SfFloatingInput
            label="Location / muster area"
            value={locationNote}
            onChange={(e) => setLocationNote(e.target.value)}
          />
          <SfFloatingInput
            label="Task type (optional)"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          />
        </SfCard>

        {byCategory.map(([category, defs]) => (
          <SfCard key={category} className="space-y-4 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {category}
            </h2>
            {defs.map((def) => {
              const row = items.find((i) => i.id === def.id)!;
              return (
                <div
                  key={def.id}
                  className="border-b border-[var(--sf-border)] pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-medium">
                    {def.label}
                    {def.critical ? (
                      <span className="ml-2 text-[10px] uppercase text-[#B33A3A]">
                        Critical
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["pass", "fail", "na"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`rounded-[3px] border px-3 py-1.5 text-xs font-semibold uppercase ${
                          row.result === r
                            ? r === "fail"
                              ? "border-[#B33A3A] bg-[rgba(179,58,58,0.15)]"
                              : r === "pass"
                                ? "border-[#4FAF6F] bg-[rgba(79,175,111,0.15)]"
                                : "border-[#1E6FB8] bg-[rgba(30,111,184,0.15)]"
                            : "border-[var(--sf-border)] text-[var(--sf-text-muted)]"
                        }`}
                        onClick={() => setResult(def.id, r)}
                      >
                        {r === "na" ? "N/A" : r}
                      </button>
                    ))}
                  </div>
                  {row.result === "fail" && (
                    <input
                      className="mt-2 w-full rounded-[3px] border border-[var(--sf-border)] bg-transparent px-3 py-2 text-sm"
                      placeholder="Defect note"
                      value={row.note ?? ""}
                      onChange={(e) => setNote(def.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </SfCard>
        ))}

        <SfCard className="space-y-4 p-6">
          <p className="text-sm">
            Overall result:{" "}
            <strong className="uppercase tracking-wide">{overall}</strong>
          </p>
          <SfFloatingTextarea
            label="Deficiencies / comments"
            value={deficiencies}
            onChange={(e) => setDeficiencies(e.target.value)}
          />
          {overall === "fail" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removedFromService}
                onChange={(e) => setRemovedFromService(e.target.checked)}
                required
              />
              Damaged PPE removed from service (required on fail)
            </label>
          )}
          {overall === "pass" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={acknowledgedSafeToWork}
                onChange={(e) => setAcknowledgedSafeToWork(e.target.checked)}
                required
              />
              I confirm this kit is safe to work
            </label>
          )}
          {overall === "conditional" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removedFromService || acknowledgedSafeToWork}
                onChange={(e) => {
                  setRemovedFromService(e.target.checked);
                  setAcknowledgedSafeToWork(e.target.checked);
                }}
              />
              Non-critical defects noted; remaining kit OK to proceed
            </label>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <SfButton type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit pre-use inspection"}
            </SfButton>
            <Link
              href="/pm/inspections/ppe-preuse"
              className="inline-flex items-center text-sm text-[var(--sf-primary)]"
            >
              Management list
            </Link>
          </div>
        </SfCard>
      </form>
    </VeraPageLayout>
  );
}
