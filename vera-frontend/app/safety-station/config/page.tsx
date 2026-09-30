"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api-fetch";

export default function SafetyStationConfigPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [syncInterval, setSyncInterval] = useState(60);
  const [cacheLimit, setCacheLimit] = useState(5000);
  const [autoReset, setAutoReset] = useState(3000);
  const [mode, setMode] = useState("standard"); // standard | hardware

  // ---------------------------------------------
  // LOAD STATIONS
  // ---------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/safety-station/list`, { credentials: "include" });
        const data = await res.json();
        setStations(data);
      } catch (err) {
        console.error("Failed to load stations", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------------------------------------------
  // SELECT STATION
  // ---------------------------------------------
  function selectStation(station: any) {
    setSelected(station);
    setName(station.name);
    setSyncInterval(station.syncInterval);
    setCacheLimit(station.cacheLimit);
    setAutoReset(station.autoReset);
    setMode(station.mode);
  }

  // ---------------------------------------------
  // SAVE SETTINGS
  // ---------------------------------------------
  async function saveSettings() {
    if (!selected) return;

    setSaving(true);

    try {
      await fetch(`${API_URL}/safety-station/${selected.id}/config`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          syncInterval,
          cacheLimit,
          autoReset,
          mode,
        }),
      });

      alert("Settings saved");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------
  // REMOTE ACTIONS
  // ---------------------------------------------
  async function remoteAction(action: string) {
    if (!selected) return;

    try {
      await fetch(`${API_URL}/safety-station/${selected.id}/action/${action}`, {
        method: "POST",
        credentials: "include",
      });

      alert(`Action '${action}' sent`);
    } catch (err) {
      console.error("Failed to send action", err);
      alert("Action failed");
    }
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading stations…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold">Safety Station Admin Config</h1>

      {/* Station List */}
      <div className="bg-white p-4 rounded shadow border space-y-3">
        <h2 className="text-xl font-semibold">Stations</h2>

        {stations.length === 0 && (
          <p className="text-gray-500">No stations registered.</p>
        )}

        <div className="space-y-2">
          {stations.map((s) => (
            <button
              key={s.id}
              onClick={() => selectStation(s)}
              className={`w-full text-left p-3 rounded border ${
                selected?.id === s.id
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-600">
                Station ID: {s.id} — Mode: {s.mode}
              </p>
              <p className="text-xs text-gray-500">
                Last heartbeat:{" "}
                {s.lastHeartbeat
                  ? new Date(s.lastHeartbeat).toLocaleString()
                  : "Never"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Config Panel */}
      {selected && (
        <div className="bg-white p-6 rounded shadow border space-y-6">
          <h2 className="text-2xl font-semibold">
            Configure: {selected.name}
          </h2>

          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Station Name</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block font-medium mb-1">Mode</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="standard">Standard (Online)</option>
              <option value="hardware">Hardware (Offline Cache)</option>
            </select>
          </div>

          {/* Sync Interval */}
          <div>
            <label className="block font-medium mb-1">
              Sync Interval (seconds)
            </label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
            />
          </div>

          {/* Cache Limit */}
          <div>
            <label className="block font-medium mb-1">
              Cache Limit (records)
            </label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={cacheLimit}
              onChange={(e) => setCacheLimit(Number(e.target.value))}
            />
          </div>

          {/* Auto Reset */}
          <div>
            <label className="block font-medium mb-1">
              Auto Reset Delay (ms)
            </label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={autoReset}
              onChange={(e) => setAutoReset(Number(e.target.value))}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>

          {/* Remote Actions */}
          <div className="pt-6 border-t space-y-3">
            <h3 className="text-xl font-semibold">Remote Actions</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => remoteAction("reboot")}
                className="rounded-[3px] border border-[#2A2E33] bg-[#3B3F45] p-3 font-medium text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#454A51] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Reboot Station
              </button>

              <button
                onClick={() => remoteAction("lock")}
                className="rounded-[3px] border border-[#A8842F] bg-[#C89F3D] p-3 font-medium text-[#1C1A10] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Lock Station
              </button>

              <button
                onClick={() => remoteAction("unlock")}
                className="rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] p-3 font-medium text-[#0F1A12] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#45A064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Unlock Station
              </button>

              <button
                onClick={() => remoteAction("clear-cache")}
                className="rounded-[3px] border border-[#174F86] bg-[#1E6FB8] p-3 font-medium text-[#F4F6F8] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1A63A6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
