import { apiGet } from "@/lib/api";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SafetyStationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/auth/login?callbackUrl=/supervisor/stations");
  }

  // ---------------------------------------------
  // LOAD STATION DATA
  // ---------------------------------------------
  const stations = await apiGet("/supervisor/stations");

  return (
    <main className="p-6 bg-black text-white min-h-screen space-y-8 pb-24">
      <h1 className="text-3xl font-bold text-center">Safety Stations</h1>

      <div className="space-y-4">
        {stations.map((s: any) => {
          const isOnline =
            s.lastHeartbeat &&
            Date.now() - new Date(s.lastHeartbeat).getTime() < 1000 * 60 * 2; // 2 minutes

          return (
            <div
              key={s.id}
              className="p-4 bg-gray-900 rounded border border-gray-700"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{s.name}</h2>

                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    isOnline ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </span>
              </div>

              {/* Details */}
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  <strong>Mode:</strong> {s.mode}
                </p>

                <p>
                  <strong>Last Heartbeat:</strong>{" "}
                  {s.lastHeartbeat
                    ? new Date(s.lastHeartbeat).toLocaleString()
                    : "Never"}
                </p>

                <p>
                  <strong>Last Sync:</strong>{" "}
                  {s.lastSync
                    ? new Date(s.lastSync).toLocaleString()
                    : "Never"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {s.lat && s.lng
                    ? `${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`
                    : "No GPS"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
