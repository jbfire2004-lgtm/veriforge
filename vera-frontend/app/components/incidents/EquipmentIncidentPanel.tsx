"use client";

import { useEffect, useState } from "react";
import { getEquipmentById } from "@/lib/api/equipment";
import { IncidentList } from "./IncidentList";

export function EquipmentIncidentPanel({ equipmentId }: { equipmentId: number }) {
  const [equipment, setEquipment] = useState<any>(null);

  useEffect(() => {
    getEquipmentById(equipmentId).then(setEquipment);
  }, [equipmentId]);

  if (!equipment) return <div className="p-4">Loading incidents...</div>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">Equipment Incidents</h2>
      <IncidentList incidents={equipment.incidents} />
    </div>
  );
}
