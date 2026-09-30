"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import type { SubscriptionMapPin } from "@/lib/admin-subscriptions-api";
import type { CircleMarkerProps, MapContainerProps, PopupProps, TileLayerProps } from "react-leaflet";
import { CompanyTooltip } from "./CompanyTooltip";
import { TIER_PIN_COLORS } from "./tier-colors";

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

type Props = {
  pins: SubscriptionMapPin[];
  onSelectCompany?: (companyId: number) => void;
  className?: string;
};

function pinRadius(seatsUsed: number): number {
  return Math.min(28, Math.max(8, 6 + Math.sqrt(seatsUsed) * 3));
}

export function SubscriptionMap({ pins, onSelectCompany, className }: Props) {
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

  const center = useMemo((): [number, number] => {
    if (pins.length === 0) return [53.5, -106.0];
    const lat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
    const lng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
    return [lat, lng];
  }, [pins]);

  if (!leafletReady) {
    return (
      <div className={`flex h-[420px] items-center justify-center rounded-xl border bg-vera-surface/40 ${className ?? ""}`}>
        <p className="text-sm text-vera-muted">Loading map…</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        {Object.entries(TIER_PIN_COLORS).map(([tier, color]) => (
          <span key={tier} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
            {tier}
          </span>
        ))}
        <span className="text-vera-muted">· Pin size = active users</span>
      </div>
      <div className="h-[420px] overflow-hidden rounded-xl border border-vera-charcoal/10">
        <MapContainer center={center} zoom={4} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((p) => (
            <CircleMarker
              key={p.companyId}
              center={[p.lat, p.lng]}
              radius={pinRadius(p.seatsUsed)}
              pathOptions={{
                color: TIER_PIN_COLORS[p.tier] ?? "#64748b",
                fillColor: TIER_PIN_COLORS[p.tier] ?? "#64748b",
                fillOpacity: 0.65,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectCompany?.(p.companyId),
              }}
            >
              <Popup>
                <CompanyTooltip pin={p} />
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
