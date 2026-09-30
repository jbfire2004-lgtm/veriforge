"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  activateSafetyStation,
  fetchMusterStatus,
  fetchStationAccessLogs,
  fetchStationAnalytics,
  fetchStationCailInsights,
  fetchStationHealth,
  listSafetyStations,
  registerSafetyStation,
  validateStationWorker,
  type StationWorkerValidation,
} from "@/lib/pm-safety-stations";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

type Tab = "monitor" | "validate" | "stations" | "muster" | "insights";

export default function PmSafetyStationsDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [tab, setTab] = useState<Tab>("monitor");
  const [stations, setStations] = useState<Array<Record<string, unknown>>>([]);
  const [health, setHealth] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [accessLogs, setAccessLogs] = useState<Array<Record<string, unknown>>>([]);
  const [muster, setMuster] = useState<Record<string, unknown> | null>(null);
  const [workerId, setWorkerId] = useState("1");
  const [stationCode, setStationCode] = useState("");
  const [validation, setValidation] = useState<StationWorkerValidation | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const reload = useCallback(() => {
    void listSafetyStations(companyId, projectId).then(setStations).catch(() => undefined);
    void fetchStationHealth(projectId).then(setHealth).catch(() => undefined);
    void fetchStationAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchStationCailInsights(projectId).then(setInsights).catch(() => undefined);
    void fetchStationAccessLogs({ projectId, limit: 50 }).then(setAccessLogs).catch(() => undefined);
    void fetchMusterStatus(projectId).then(setMuster).catch(() => undefined);
  }, [companyId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function runValidation() {
    const wid = parseInt(workerId, 10);
    if (!wid || !stationCode.trim()) return;
    const r = await validateStationWorker({
      workerId: wid,
      projectId,
      stationCode: stationCode.trim(),
    });
    setValidation(r);
    reload();
  }

  async function registerStation() {
    if (!newCode.trim() || !newName.trim()) return;
    await registerSafetyStation({
      code: newCode.trim(),
      name: newName.trim(),
      companyId,
      projectId,
      stationType: "zone",
    });
    setNewCode("");
    setNewName("");
    reload();
  }

  return (
    <VeraPageLayout
      title="Safety stations"
      description={`Registration, heartbeat monitoring, worker/equipment validation, muster, offline sync — project #${projectId}`}
    >
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Station uptime</p>
            <p className="text-2xl font-semibold">{String(analytics.stationUptimePct)}%</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Access granted</p>
            <p className="text-2xl font-semibold text-green-700">
              {String((analytics.access as { granted?: number })?.granted ?? 0)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Access denied</p>
            <p className="text-2xl font-semibold text-red-600">
              {String((analytics.access as { denied?: number })?.denied ?? 0)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Muster check-ins (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.musterCheckins)}</p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(
          [
            ["monitor", "Heartbeat"],
            ["validate", "Validate worker"],
            ["stations", "Stations"],
            ["muster", "Muster"],
            ["insights", "CAIL"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "rounded-md bg-[var(--sf-primary)] px-3 py-1.5 text-sm text-white"
                : "rounded-md px-3 py-1.5 text-sm text-[var(--sf-text-muted)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "monitor" ? (
        <SfCard className="p-4">
          <h2 className="font-medium">Station health</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {health.map((h) => (
              <li key={String(h.id)} className="flex justify-between border-b py-2">
                <span>
                  {String(h.name)} ({String(h.code)})
                </span>
                <span className={h.healthy ? "text-green-700" : "text-red-600"}>
                  {h.healthy ? "Healthy" : "Stale / offline"}
                </span>
              </li>
            ))}
            {health.length === 0 ? (
              <li className="text-[var(--sf-text-muted)]">No active stations</li>
            ) : null}
          </ul>
        </SfCard>
      ) : null}

      {tab === "validate" ? (
        <SfCard className="space-y-4 p-4">
          <SfInput
            label="Station code"
            value={stationCode}
            onChange={(e) => setStationCode(e.target.value)}
          />
          <SfInput
            label="Worker ID"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          />
          <SfButton onClick={() => void runValidation()}>Validate sign-in</SfButton>
          {validation ? (
            <div
              className={
                validation.granted
                  ? "rounded border border-green-200 bg-green-50 p-3 text-sm"
                  : "rounded border border-red-200 bg-red-50 p-3 text-sm"
              }
            >
              <p className="font-medium">
                {validation.granted ? "Access granted" : "Access denied"}
              </p>
              {validation.denialReasons?.length ? (
                <ul className="mt-2 list-disc pl-5">
                  {validation.denialReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </SfCard>
      ) : null}

      {tab === "stations" ? (
        <div className="space-y-4">
          <SfCard className="space-y-3 p-4">
            <h2 className="font-medium">Register station</h2>
            <SfInput label="Code" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            <SfInput label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <SfButton onClick={() => void registerStation()}>Register</SfButton>
          </SfCard>
          <SfCard className="p-4">
            <h2 className="font-medium">Registered stations</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {stations.map((s) => (
                <li key={String(s.id)} className="flex items-center justify-between border-b py-2">
                  <span>
                    {String(s.name)} — {String(s.code)} ({String(s.stationType)})
                  </span>
                  {s.status === "pending" ? (
                    <SfButton
                      variant="secondary"
                      onClick={() =>
                        void activateSafetyStation(Number(s.id)).then(reload)
                      }
                    >
                      Activate
                    </SfButton>
                  ) : (
                    <span className="text-[var(--sf-text-muted)]">{String(s.status)}</span>
                  )}
                </li>
              ))}
            </ul>
          </SfCard>
        </div>
      ) : null}

      {tab === "muster" ? (
        <SfCard className="p-4">
          <h2 className="font-medium">Muster status</h2>
          {muster?.active ? (
            <p className="mt-2 text-sm">
              Active muster — checked in: {String(muster.checkedIn)}, missing:{" "}
              {Array.isArray(muster.missingWorkerIds)
                ? muster.missingWorkerIds.length
                : 0}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--sf-text-muted)]">No active muster</p>
          )}
        </SfCard>
      ) : null}

      {tab === "insights" ? (
        <SfCard className="p-4">
          <h2 className="font-medium">CAIL insights</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {insights.map((i) => (
              <li key={String(i.title)} className="border-b pb-2">
                <p className="font-medium">{String(i.title)}</p>
                <p className="text-[var(--sf-text-muted)]">{String(i.explanation)}</p>
              </li>
            ))}
            {insights.length === 0 ? (
              <li className="text-[var(--sf-text-muted)]">No insights</li>
            ) : null}
          </ul>
        </SfCard>
      ) : null}

      <SfCard className="p-4">
        <h2 className="font-medium">Recent access logs</h2>
        <ul className="mt-3 max-h-64 overflow-y-auto text-sm">
          {accessLogs.map((l) => (
            <li key={String(l.id)} className="border-b py-1">
              Worker {String(l.workerId)} — {l.granted ? "granted" : "denied"} @{" "}
              {new Date(String(l.createdAt)).toLocaleString()}
            </li>
          ))}
        </ul>
      </SfCard>
    </VeraPageLayout>
  );
}
