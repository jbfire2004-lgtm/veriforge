"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  buildEmergencyQuickAccessPack,
  isBrowserOnline,
  readQuickAccessOffline,
  saveQuickAccessOffline,
  type EmergencyQuickAccessPack,
  type ImmediateAction,
  type QuickAccessScenario,
} from "@/lib/emergency-quick-access";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

const SCENARIOS: Array<{ id: QuickAccessScenario; label: string }> = [
  { id: "general", label: "General" },
  { id: "electrical", label: "Electrical" },
  { id: "fall", label: "Fall" },
  { id: "trench", label: "Trench" },
  { id: "chemical", label: "Chemical" },
  { id: "rollover", label: "Rollover" },
];

function telHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned || phone}`;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function actionStyle(kind: ImmediateAction["kind"]): CSSProperties {
  if (kind === "call") {
    return { background: "#B33A3A", color: "#F4F6F8", borderColor: "#8F2E2E" };
  }
  if (kind === "muster" || kind === "radio") {
    return { background: "#C89F3D", color: "#1C1A10", borderColor: "#A8842F" };
  }
  return {
    background: "#2A2E33",
    color: "#F4F6F8",
    borderColor: "#1F2328",
  };
}

export function EmergencyQuickAccessView({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const q = `projectId=${projectId}&companyId=${companyId}`;
  const [scenario, setScenario] = useState<QuickAccessScenario>("general");
  const [pack, setPack] = useState<EmergencyQuickAccessPack | null>(null);
  const [source, setSource] = useState<"live" | "offline" | "local">("local");
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);

  const applyPack = useCallback(
    (
      next: EmergencyQuickAccessPack,
      src: "live" | "offline" | "local",
      savedAt?: string,
    ) => {
      setPack(next);
      setSource(src);
      setCachedAt(savedAt ?? null);
      setScenario(next.scenario);
    },
    [],
  );

  const load = useCallback(
    async (nextScenario?: QuickAccessScenario) => {
      const sc = nextScenario ?? scenario;
      const cached = readQuickAccessOffline(projectId, companyId);
      const onlineNow = isBrowserOnline();
      setOnline(onlineNow);

      if (!onlineNow) {
        if (cached) {
          applyPack(
            {
              ...cached.pack,
              scenario: sc,
              procedures:
                sc === cached.pack.scenario
                  ? cached.pack.procedures
                  : buildEmergencyQuickAccessPack({
                      ...cached.pack,
                      scenario: sc,
                    }).procedures,
            },
            "offline",
            cached.savedAt,
          );
          return;
        }
        applyPack(
          buildEmergencyQuickAccessPack({
            projectId,
            companyId,
            scenario: sc,
          }),
          "local",
        );
        return;
      }

      try {
        const res = await fetch(
          `/api/v1/emergency-quick-access?${q}&scenario=${sc}&region=CA-SK`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { data: EmergencyQuickAccessPack };
        saveQuickAccessOffline(json.data);
        applyPack(json.data, "live", new Date().toISOString());
      } catch {
        if (cached) {
          applyPack(cached.pack, "offline", cached.savedAt);
        } else {
          const local = buildEmergencyQuickAccessPack({
            projectId,
            companyId,
            scenario: sc,
          });
          saveQuickAccessOffline(local);
          applyPack(local, "local", new Date().toISOString());
        }
      }
    },
    [applyPack, companyId, projectId, q, scenario],
  );

  useEffect(() => {
    void load(scenario);
    const onOnline = () => {
      setOnline(true);
      void load(scenario);
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [load, scenario]);

  function handleSaveOffline() {
    if (!pack) return;
    saveQuickAccessOffline(pack);
    setCachedAt(new Date().toISOString());
    setFlash("Offline pack saved on this device");
    window.setTimeout(() => setFlash(null), 2500);
  }

  function handleAction(action: ImmediateAction) {
    if (action.kind === "call" && action.phone) {
      window.location.href = telHref(action.phone);
      return;
    }
    if (action.jumpTo) scrollToId(action.jumpTo);
  }

  const statusLabel = !online
    ? "OFFLINE"
    : source === "live"
      ? "LIVE"
      : source === "offline"
        ? "CACHED"
        : "LOCAL";

  return (
    <VeraPageLayout
      title="Emergency quick access"
      description="One-tap immediate actions, verified contacts, muster, equipment, and ERP procedures — available offline on this device."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{
              background: online ? "#4FAF6F" : "#B33A3A",
              color: online ? "#0F1A12" : "#F4F6F8",
            }}
          >
            {statusLabel}
          </span>
          <Link
            href={`/pm/emergency-response?${q}`}
            className="rounded border px-3 py-1.5 text-xs font-semibold"
          >
            Emergency hub
          </Link>
          <SfButton type="button" variant="secondary" size="sm" onClick={handleSaveOffline}>
            Save offline pack
          </SfButton>
        </div>
      }
    >
      <div className="space-y-4">
        {flash ? (
          <p className="text-xs font-medium text-emerald-700">{flash}</p>
        ) : null}

        <SfCard className="space-y-3 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--sf-text-muted)]">
                Site / scenario
              </p>
              <p className="font-medium">
                {pack?.projectName ?? "…"} · {pack?.regionCode ?? "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                {pack?.siteAddress}
                {cachedAt
                  ? ` · Pack saved ${new Date(cachedAt).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-[var(--sf-text-muted)]">
                Active scenario
              </span>
              <select
                className="rounded border border-[var(--sf-border)] bg-transparent px-3 py-2"
                value={scenario}
                onChange={(e) =>
                  setScenario(e.target.value as QuickAccessScenario)
                }
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!online ? (
            <p className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
              Device is offline — showing saved pack. Call 911 still works via
              the phone dialer. {pack?.offline.guidance}
            </p>
          ) : null}
        </SfCard>

        <section id="section-actions">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
            Immediate actions
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(pack?.immediateActions ?? []).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleAction(a)}
                className="min-h-[5.5rem] rounded-xl border px-4 py-3 text-left shadow-sm transition active:scale-[0.99]"
                style={actionStyle(a.kind)}
              >
                <span className="block text-lg font-bold leading-tight">
                  {a.label}
                </span>
                <span className="mt-1 block text-xs opacity-90">{a.detail}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="section-contacts">
          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">Emergency contacts</h2>
            <p className="text-xs text-[var(--sf-text-muted)]">
              Verified numbers only (911 + utility catalog). Site/company numbers
              appear when configured — never invented.
            </p>

            {pack?.hazardRouting && pack.hazardRouting.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--sf-text-muted)]">
                  Hazard-specific routing
                </h3>
                <ul className="mt-2 divide-y rounded-lg border border-amber-300/60 bg-amber-50/40">
                  {pack.hazardRouting.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-[var(--sf-text-muted)]">
                          {c.reason}
                        </p>
                      </div>
                      {c.phone ? (
                        <a
                          href={telHref(c.phone)}
                          className="rounded-lg px-4 py-2 text-sm font-bold"
                          style={{ background: "#B33A3A", color: "#F4F6F8" }}
                        >
                          Call {c.phone}
                        </a>
                      ) : (
                        <span className="max-w-xs text-xs text-[var(--sf-text-muted)]">
                          {c.dialHint}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ul className="divide-y rounded-lg border border-[var(--sf-border)]">
              {(pack?.contacts ?? []).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-[var(--sf-text-muted)]">
                      {c.role}
                      {c.notes ? ` · ${c.notes}` : ""}
                      {c.verified ? " · verified" : ""}
                    </p>
                  </div>
                  {c.phone ? (
                    <a
                      href={telHref(c.phone)}
                      className="rounded-lg px-4 py-2 text-sm font-bold"
                      style={{ background: "#B33A3A", color: "#F4F6F8" }}
                    >
                      Call {c.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--sf-text-muted)]">
                      {c.dialHint}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p
              id="section-radio"
              className="rounded border border-[var(--sf-border)] px-3 py-2 text-sm"
            >
              <span className="font-semibold">Radio: </span>
              {pack?.radioChannel ?? "—"}
            </p>
            <p className="text-xs text-[var(--sf-text-muted)] whitespace-pre-wrap">
              Dispatcher script: {pack?.callScript}
            </p>
          </SfCard>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section id="section-muster">
            <SfCard className="space-y-3 p-5">
              <h2 className="font-medium">Muster points</h2>
              <ul className="space-y-2">
                {(pack?.musterPoints ?? []).map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg border border-[var(--sf-border)] px-3 py-3"
                  >
                    <p className="font-semibold">
                      {m.name}
                      {m.primary ? (
                        <span className="ml-2 text-[10px] uppercase text-[var(--sf-text-muted)]">
                          primary
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                      {m.description}
                    </p>
                  </li>
                ))}
              </ul>
            </SfCard>
          </section>

          <section id="section-equipment">
            <SfCard className="space-y-3 p-5">
              <h2 className="font-medium">Equipment locations</h2>
              <ul className="divide-y rounded-lg border border-[var(--sf-border)]">
                {(pack?.equipment ?? []).map((e) => (
                  <li key={e.id} className="px-3 py-2.5 text-sm">
                    <span className="font-semibold">{e.name}</span>
                    {e.qty != null ? (
                      <span className="ml-2 text-xs text-[var(--sf-text-muted)]">
                        ×{e.qty}
                      </span>
                    ) : null}
                    <p className="text-xs text-[var(--sf-text-muted)]">
                      {e.location}
                    </p>
                  </li>
                ))}
              </ul>
            </SfCard>
          </section>
        </div>

        <section id="section-procedures">
          <SfCard className="space-y-3 p-5">
            <h2 className="font-medium">
              ERP procedures — {scenario.replace(/_/g, " ")}
            </h2>
            <ol className="space-y-2">
              {(pack?.procedures ?? []).map((step) => (
                <li
                  key={step.order}
                  className="flex gap-3 rounded-lg border border-[var(--sf-border)] px-3 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-surface)] text-sm font-bold">
                    {step.order}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-sm text-[var(--sf-text-muted)]">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </SfCard>
        </section>

        <section id="section-account">
          <SfCard className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="font-medium">Accountability</h2>
              <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
                Run headcount and mark missing from the ERP drill flow.
              </p>
            </div>
            <Link
              href={`/pm/emergency-response/drill?${q}`}
              className="rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: "#1E6FB8", color: "#F4F6F8" }}
            >
              Open ERP drill
            </Link>
          </SfCard>
        </section>
      </div>
    </VeraPageLayout>
  );
}
