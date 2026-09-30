import { apiGet } from "@/lib/api";

export default async function PublicWorkerPage({ params }: any) {
  const id = params.id;

  const data = await apiGet(`/verify/worker/${id}/full`);

  const { worker, certifications, expiredCerts, activeIncidents } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{worker.firstName} {worker.lastName}</h1>

      {/* Worker Info */}
      <section className="bg-white text-black p-4 rounded shadow space-y-2">
        <p><span className="font-semibold">Worker ID:</span> {worker.id}</p>
        <p><span className="font-semibold">Company:</span> {worker.company?.name || "N/A"}</p>
      </section>

      {/* Certifications */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Certifications</h2>

        {certifications.length === 0 && (
          <p className="text-gray-500">No certifications found.</p>
        )}

        <div className="space-y-3">
          {certifications.map((c: any) => (
            <div key={c.id} className="p-3 bg-white text-black rounded shadow">
              <p className="font-semibold">{c.certification.name}</p>
              <p className="text-gray-600 text-sm">
                Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Expired */}
      {expiredCerts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3 text-red-600">Expired Certifications</h2>

          <div className="space-y-3">
            {expiredCerts.map((c: any) => (
              <div key={c.id} className="p-3 bg-red-100 text-black rounded shadow">
                <p className="font-semibold">{c.certification.name}</p>
                <p className="text-gray-700 text-sm">
                  Expired: {new Date(c.expiresAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Incidents */}
      {activeIncidents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3 text-red-600">Active Incidents</h2>

          <div className="space-y-3">
            {activeIncidents.map((i: any) => (
              <div key={i.id} className="p-3 bg-red-100 text-black rounded shadow">
                <p className="font-semibold">Incident #{i.id}</p>
                <p className="text-gray-700 text-sm">{i.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
