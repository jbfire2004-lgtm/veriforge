"use client";

import { useMemo, useState } from "react";
import type { InspectionChecklist } from "@/lib/api/inspection";
import { InspectionChecklistForm } from "./InspectionChecklistForm";
import { Label, Select } from "@/components/ui";

type EquipmentRow = { id: number; name: string; lockedOutAt?: string | null };
type WorkerRow = { id: number; firstName: string; lastName: string };

export function PreUseInspectionPicker({
  equipment,
  checklists,
  workers = [],
  initialEquipmentId,
}: {
  equipment: EquipmentRow[] | { items?: EquipmentRow[] };
  checklists: InspectionChecklist[];
  workers?: WorkerRow[];
  initialEquipmentId?: string;
}) {
  const list = Array.isArray(equipment)
    ? equipment
    : (equipment as { items?: EquipmentRow[] }).items ?? [];

  const defaultChecklist = checklists[0];
  const initialEq =
    initialEquipmentId && list.some((e) => String(e.id) === initialEquipmentId)
      ? initialEquipmentId
      : list[0]?.id
        ? String(list[0].id)
        : "";
  const [equipmentId, setEquipmentId] = useState<string>(initialEq);
  const [checklistId, setChecklistId] = useState<string>(
    defaultChecklist ? String(defaultChecklist.id) : "",
  );
  const [workerId, setWorkerId] = useState<string>("");

  const selectedEquipment = useMemo(
    () => list.find((e) => String(e.id) === equipmentId),
    [list, equipmentId],
  );
  const selectedChecklist = useMemo(
    () => checklists.find((c) => String(c.id) === checklistId),
    [checklists, checklistId],
  );

  if (!defaultChecklist) {
    return <p className="text-muted-foreground">No pre-use checklist configured.</p>;
  }

  return (
    <section className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <Label>Equipment</Label>
          <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
            {list.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
                {eq.lockedOutAt ? " (locked out)" : ""}
              </option>
            ))}
          </Select>
        </section>
        <section>
          <Label>Checklist</Label>
          <Select value={checklistId} onChange={(e) => setChecklistId(e.target.value)}>
            {checklists.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </section>
        {workers.length > 0 && (
          <section>
            <Label>Operator (optional)</Label>
            <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              <option value="">— Not recorded —</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName}
                </option>
              ))}
            </Select>
          </section>
        )}
      </section>

      {selectedEquipment && selectedChecklist && (
        <InspectionChecklistForm
          equipmentId={selectedEquipment.id}
          equipmentName={selectedEquipment.name}
          checklistId={selectedChecklist.id}
          inspectionType="PRE_USE"
          items={selectedChecklist.items}
          workerId={workerId ? Number(workerId) : undefined}
          title="Pre-use inspection"
          redirectTo="/admin/inspections"
        />
      )}
    </section>
  );
}
