"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PopupProps,
  CircleMarkerProps,
} from "react-leaflet";

import { apiFetchJson, apiWsOrigin } from "@/lib/api-fetch";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Card,
  CardContent,
  ErrorState,
  Skeleton,
} from "@/components/ui";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
) as ComponentType<MapContainerProps>;
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
) as ComponentType<TileLayerProps>;
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
) as ComponentType<MarkerProps>;
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
) as ComponentType<PopupProps>;
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
) as ComponentType<CircleMarkerProps>;

type MapWorker = {
  id: number;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  lastScan: string;
};

type MapEquipment = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  isSafe: boolean;
};

type MapStation = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  isOnline: boolean;
  mode: string;
  lastHeartbeat: string;
};

type MapIncident = {
  id: number;
  lat: number;
  lng: number;
  type: string;
  category?: string | null;
  createdAt: string;
};

type WsUpdate =
  | ({ type: "worker-update"; id: number } & Partial<MapWorker>)
  | ({ type: "equipment-update"; id: number } & Partial<MapEquipment>)
  | ({ type: "station-update"; id: number } & Partial<MapStation>)
  | (MapIncident & { type?: "incident"; msgType?: "incident" });

function isWsUpdate(value: unknown): value is WsUpdate {
  return (
    typeof value === "object" &&
    value !== null &&
    ("type" in value || "msgType" in value)
  );
}

const ADMIN_BREADCRUMBS = [
  { label: "Admin", href: "/admin" },
  { label: "Safety map" },
];

export default function SafetyMapPage() {
  const [workers, setWorkers] = useState<MapWorker[]>([]);
  const [equipment, setEquipment] = useState<MapEquipment[]>([]);
  const [stations, setStations] = useState<MapStation[]>([]);
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [w, e, s, i] = await Promise.all([
          apiFetchJson<MapWorker[]>(`/map/workers`, { requireAuth: false }),
          apiFetchJson<MapEquipment[]>(`/map/equipment`, { requireAuth: false }),
          apiFetchJson<MapStation[]>(`/map/stations`, { requireAuth: false }),
          apiFetchJson<MapIncident[]>(`/map/incidents`, { requireAuth: false }),
        ]);
        if (cancelled) return;
        setWorkers(w);
        setEquipment(e);
        setStations(s);
        setIncidents(i);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load map data"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadError) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${apiWsOrigin()}/map/live`);
    } catch (err) {
      console.warn("Live map socket disabled", err);
      return;
    }

    ws.onmessage = (msg) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(msg.data);
      } catch {
        return;
      }
      if (!isWsUpdate(parsed)) return;

      if (parsed.type === "worker-update") {
        const patch = parsed;
        setWorkers((prev) =>
          prev.map((w) => (w.id === patch.id ? { ...w, ...patch } : w))
        );
        return;
      }
      if (parsed.type === "equipment-update") {
        const patch = parsed;
        setEquipment((prev) =>
          prev.map((e) => (e.id === patch.id ? { ...e, ...patch } : e))
        );
        return;
      }
      if (parsed.type === "station-update") {
        const patch = parsed;
        setStations((prev) =>
          prev.map((s) => (s.id === patch.id ? { ...s, ...patch } : s))
        );
        return;
      }
      if (parsed.msgType === "incident" || parsed.type === "incident") {
        const next: MapIncident = {
          id: parsed.id,
          lat: parsed.lat,
          lng: parsed.lng,
          type: parsed.type ?? parsed.category ?? "Incident",
          category: parsed.category ?? null,
          createdAt: parsed.createdAt,
        };
        setIncidents((prev) => {
          const without = prev.filter((x) => x.id !== next.id);
          return [...without, next];
        });
      }
    };

    return () => {
      ws?.close();
    };
  }, [loadError]);

  const center = useMemo<[number, number]>(() => [52.326, -106.584], []);

  if (loading) {
    return (
      <AdminPageShell
        title="Safety map"
        breadcrumbs={ADMIN_BREADCRUMBS}
      >
        <div className="space-y-vera-4">
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-[60vh] w-full rounded-2xl" />
        </div>
      </AdminPageShell>
    );
  }

  if (loadError) {
    return (
      <AdminPageShell
        title="Safety map"
        breadcrumbs={ADMIN_BREADCRUMBS}
      >
        <ErrorState
          title="Couldn't load map data"
          description={loadError}
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Real-time safety map"
      description="Workers, equipment, stations, and incidents on one live view."
      breadcrumbs={ADMIN_BREADCRUMBS}
    >
      <Card className="overflow-hidden border-vera-charcoal/10 p-0">
        <CardContent className="p-0">
          <div className="h-[80vh] w-full">
            <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {workers.map((w) => (
                <Marker key={`w-${w.id}`} position={[w.lat, w.lng]}>
                  <Popup>
                    <div className="space-y-1 text-vera-charcoal">
                      <p className="font-semibold">
                        {w.firstName} {w.lastName}
                      </p>
                      <p className="text-xs text-vera-muted">Worker ID: {w.id}</p>
                      <p className="text-xs text-vera-muted">
                        Last scan: {new Date(w.lastScan).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {equipment.map((e) => (
                <Marker key={`e-${e.id}`} position={[e.lat, e.lng]}>
                  <Popup>
                    <div className="space-y-1 text-vera-charcoal">
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-xs text-vera-muted">Equipment ID: {e.id}</p>
                      <p className={`text-xs font-semibold ${e.isSafe ? "text-emerald-700" : "text-red-600"}`}>
                        {e.isSafe ? "Safe" : "Unsafe"}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {stations.map((s) => (
                <CircleMarker
                  key={`s-${s.id}`}
                  center={[s.lat, s.lng]}
                  radius={12}
                  pathOptions={{ color: s.isOnline ? "green" : "red", fillOpacity: 0.8 }}
                >
                  <Popup>
                    <div className="space-y-1 text-vera-charcoal">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-vera-muted">Station ID: {s.id}</p>
                      <p className="text-xs text-vera-muted">Mode: {s.mode === "hardware" ? "Hardware" : "Standard"}</p>
                      <p className="text-xs text-vera-muted">
                        Last heartbeat: {new Date(s.lastHeartbeat).toLocaleString()}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {incidents.map((i) => (
                <CircleMarker
                  key={`i-${i.id}`}
                  center={[i.lat, i.lng]}
                  radius={14}
                  pathOptions={{ color: "orange", fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div className="space-y-1 text-vera-charcoal">
                      <p className="font-semibold text-orange-600">Incident</p>
                      <p className="text-xs text-vera-muted">{i.category ?? i.type}</p>
                      <p className="text-xs text-vera-muted">{new Date(i.createdAt).toLocaleString()}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}






























