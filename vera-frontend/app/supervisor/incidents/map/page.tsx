"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

export default function IncidentMapPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    apiGet("/incidents")
      .then(setIncidents)
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function patchLeafletIcons() {
      const leaflet = await import("leaflet");
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
      setLeafletReady(true);
    }

    void patchLeafletIcons().catch((error) => {
      console.error("Failed to initialize Leaflet", error);
    });
  }, []);

  const geoTagged = incidents.filter(
    (i) => i.latitude != null && i.longitude != null
  );

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Incident map</h1>
        <Link
          href="/supervisor/incidents"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to incidents
        </Link>
      </div>

      {geoTagged.length === 0 && (
        <p className="text-gray-600 text-sm">
          No geotagged incidents yet. New reports with GPS will appear here.
        </p>
      )}

      <div className="w-full h-[600px] border rounded overflow-hidden">
        {!leafletReady ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Initializing map...
          </div>
        ) : (
          <MapContainer
            center={[52.1332, -106.67]}
            zoom={9}
            scrollWheelZoom
            className="w-full h-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {geoTagged.map((i) => (
              <Marker key={i.id} position={[i.latitude, i.longitude]}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{i.title}</p>
                    {i.category && (
                      <p className="text-xs text-gray-600">{i.category}</p>
                    )}
                    <p className="text-xs text-gray-600">Severity: {i.severity}</p>
                    {i.description && (
                      <p className="text-sm">{i.description}</p>
                    )}
                    <Link
                      href={`/supervisor/incidents/${i.id}`}
                      className="text-xs text-blue-600 underline"
                    >
                      Open workflow
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(i.createdAt).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </main>
  );
}
