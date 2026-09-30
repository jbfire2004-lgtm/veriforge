"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import type { AdoptionMapCompany } from "@vera/api-contract";
import type { CircleMarkerProps, MapContainerProps, PopupProps, TileLayerProps } from "react-leaflet";
import { fetchAdoptionMap } from "@/lib/adoption/api";
import { Card, CardContent, ErrorState, Skeleton } from "@/components/ui";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
) as ComponentType<MapContainerProps>;
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
) as ComponentType<TileLayerProps>;
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
) as ComponentType<CircleMarkerProps>;
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
) as ComponentType<PopupProps>;

function churnColor(score: number): string {
  if (score >= 70) return "#ef4444";
  if (score >= 40) return "#C89F3D";
  return "#2F8F8C";
}

export function AdoptionMapPanel() {
  const [companies, setCompanies] = useState<AdoptionMapCompany[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    void import("leaflet").then((leaflet) => {
      delete (leaflet.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAdoptionMap()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load map data");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mapped = useMemo(
    () => (companies ?? []).filter((c) => c.lat != null && c.lng != null),
    [companies],
  );

  const center = useMemo((): [number, number] => {
    if (mapped.length === 0) return [53.5, -106.0];
    const lat =
      mapped.reduce((s, c) => s + (c.lat ?? 0), 0) / mapped.length;
    const lng =
      mapped.reduce((s, c) => s + (c.lng ?? 0), 0) / mapped.length;
    return [lat, lng];
  }, [mapped]);

  if (error) {
    return <ErrorState title="Adoption map" message={error} />;
  }

  if (!companies) {
    return <Skeleton className="h-[420px] w-full rounded-2xl" />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 overflow-hidden border-[#2A2E33]/10">
        <CardContent className="p-0">
          <div className="h-[420px] w-full">
            {!leafletReady ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MapContainer
                center={center}
                zoom={mapped.length > 1 ? 4 : 6}
                className="h-full w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapped.map((c) => {
                  const workers = c.analytics?.totalWorkers ?? 0;
                  const radius = Math.min(28, Math.max(8, 6 + workers / 5));
                  const churn = c.analytics?.churnRiskScore ?? 0;
                  return (
                    <CircleMarker
                      key={c.id}
                      center={[c.lat!, c.lng!]}
                      radius={radius}
                      pathOptions={{
                        color: churnColor(churn),
                        fillColor: churnColor(churn),
                        fillOpacity: 0.55,
                      }}
                    >
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-[#64748b]">
                            {[c.city, c.province].filter(Boolean).join(", ") ||
                              "Location not set"}
                          </p>
                          <p>Workers: {workers}</p>
                          <p>
                            Active (30d): {c.analytics?.activeUsers30d ?? 0}
                          </p>
                          <p>Churn risk: {churn.toFixed(0)}</p>
                          {c.analytics?.modulesUsed ? (
                            <p className="text-xs text-[#64748b]">
                              Modules:{" "}
                              {Object.keys(c.analytics.modulesUsed).slice(0, 4).join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#2A2E33]/10">
        <CardContent className="max-h-[420px] space-y-3 overflow-y-auto pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
            Companies ({companies.length})
          </p>
          {companies.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-[#2A2E33]/10 bg-[#f8fafc] px-3 py-2 text-sm"
            >
              <p className="font-semibold text-[#2A2E33]">{c.name}</p>
              <p className="text-xs text-[#64748b]">
                {c.analytics?.totalWorkers ?? 0} workers · risk{" "}
                {(c.analytics?.churnRiskScore ?? 0).toFixed(0)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
