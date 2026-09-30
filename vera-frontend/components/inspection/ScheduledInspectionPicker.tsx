"use client";

import { useMemo, useState } from "react";
import type { InspectionChecklist, InspectionType } from "@/lib/api/inspection";
import { InspectionChecklistForm } from "./InspectionChecklistForm";
import { Label, Select } from "@/components/ui";

type EquipmentRow = { id: number; name: string };

export function ScheduledInspectionPicker({
  equipment,
  checklists,
  initialEquipmentId,
}: {
  equipment: EquipmentRow[];
  checklists: InspectionChecklist[];
  initialEquipmentId?: string;
}) {
  const initialEq =
    initialEquipmentId && equipment.some((e) => String(e.id) === initialEquipmentId)
      ? initialEquipmentId
      : equipment[0]?.id
        ? String(equipment[0].id)
        : "";
  const [equipmentId, setEquipmentId] = useState<string>(initialEq);
  const [checklistId, setChecklistId] = useState<string>(
    checklists[0]?.id ? String(checklists[0].id) : "",
  );

  const selectedEquipment = useMemo(
    () => equipment.find((e) => String(e.id) === equipmentId),
    [equipment, equipmentId],
  );
  const selectedChecklist = useMemo(
    () => checklists.find((c) => String(c.id) === checklistId),
    [checklists, checklistId],
  );

  if (!checklists.length) {
    return <p className="text-muted-foreground">No scheduled checklists configured.</p>;
  }

  return (
    <section className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <section>
          <Label>Equipment</Label>
          <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </Select>
        </section>
        <section>
          <Label>Inspection type & checklist</Label>
          <Select value={checklistId} onChange={(e) => setChecklistId(e.target.value)}>
            {checklists.map((c) => (
              <option key={c.id} value={c.id}>
                {c.inspectionType} — {c.name}
              </option>
            ))}
          </Select>
        </section>
      </section>

      {selectedEquipment && selectedChecklist && (
        <InspectionChecklistForm
          equipmentId={selectedEquipment.id}
          equipmentName={selectedEquipment.name}
          checklistId={selectedChecklist.id}
          inspectionType={selectedChecklist.inspectionType as InspectionType}
          items={selectedChecklist.items}
          title={selectedChecklist.name}
          redirectTo="/admin/inspections"
        />
      )}
    </section>
  );
}
