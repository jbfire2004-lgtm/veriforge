import { apiFetchJson } from '@/lib/api-fetch';

async function getEquipment(id: string) {
  return apiFetchJson<any>(`/supervisor/equipment/${id}`, { cache: 'no-store' });
}

export default async function EquipmentDetailPage({ params }: any) {
  const equipment = await getEquipment(params.id);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">
        {equipment.name}
      </h1>

      {/* Profile */}
      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Equipment Profile</h2>
        <p><strong>ID:</strong> {equipment.id}</p>
        <p><strong>Serial:</strong> {equipment.serialNumber || 'N/A'}</p>
        <p><strong>Company:</strong> {equipment.companyId}</p>
        <p><strong>Status:</strong> {equipment.isSafe ? 'Safe' : 'Unsafe'}</p>
        <p><strong>Created:</strong> {new Date(equipment.createdAt).toLocaleString()}</p>
      </section>

      {/* Required Certifications */}
      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Required Certifications</h2>
        <div className="divide-y">
          {equipment.equipmentCertificationRequirements.length === 0 && (
            <p className="text-sm text-gray-500">No certification requirements</p>
          )}
          {equipment.equipmentCertificationRequirements.map((req: any) => (
            <div key={req.id} className="py-2">
              <p className="font-medium">{req.certification.name}</p>
              {req.certification.description && (
                <p className="text-sm text-gray-600">{req.certification.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Assignment History */}
      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Assignment History</h2>
        <div className="divide-y">
          {equipment.equipmentAssignments.length === 0 && (
            <p className="text-sm text-gray-500">No assignment history</p>
          )}
          {equipment.equipmentAssignments.map((ea: any) => (
            <div key={ea.id} className="py-2">
              <p className="font-medium">
                {ea.worker ? `${ea.worker.firstName} ${ea.worker.lastName}` : 'Unassigned'}
              </p>
              <p className="text-xs text-gray-500">
                Assigned: {new Date(ea.assignedAt).toLocaleString()}
                {ea.returnedAt && (
                  <> • Returned: {new Date(ea.returnedAt).toLocaleString()}</>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Incident History */}
      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Incident History</h2>
        <div className="divide-y">
          {equipment.incidents.length === 0 && (
            <p className="text-sm text-gray-500">No incidents recorded</p>
          )}
          {equipment.incidents.map((i: any) => (
            <div key={i.id} className="py-2">
              <p className="font-medium">{i.type}</p>
              <p className="text-xs text-gray-500">
                Severity: {i.severity} • {new Date(i.createdAt).toLocaleString()}
              </p>
              {i.description && <p className="text-sm">{i.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
