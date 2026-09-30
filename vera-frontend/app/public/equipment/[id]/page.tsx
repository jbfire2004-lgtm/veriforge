import { apiGet } from "@/lib/api";

export default async function PublicEquipmentPage({ params }: any) {
  const id = params.id;

  const data = await apiGet(`/verify/equipment/${id}/full`);

  const { equipment, requiredCerts, assignedWorkers, activeIncidents } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{equipment.name}</h1>

      {/* Equipment Info */}
      <section className="bg-white text-black p-4 rounded shadow space-y-2">
        <p><span className="font-semibold">Equipment ID:</span> {equipment.id}</p>
      </section>

      {/* Required Certifications */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Required Certifications</h2>

        {requiredCerts.length === 0 && (
          <p className="text-gray-500">No certification requirements.</p>
        )}

        <div className="space-y-3">
          {requiredCerts.map((c: any) => (
            <div key={c.id} className="p-3 bg-white text-black rounded shadow">
              <p className="font-semibold">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Assigned Workers */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Assigned Workers</h2>

        {assignedWorkers.length === 0 && (
          <p className="text-gray-500">No workers assigned.</p>
        )}

        <div className="space-y-3">
          {assignedWorkers.map((w: any) => (
            <div key={w.id} className="p-3 bg-white text-black rounded shadow">
              <p className="font-semibold">{w.firstName} {w.lastName}</p>
              <p className="text-gray-600 text-sm">Worker ID: {w.id}</p>
            </div>
          ))}
        </div>
      </section>

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
