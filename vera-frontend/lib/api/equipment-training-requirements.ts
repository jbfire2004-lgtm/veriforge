import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

export type EquipmentTrainingRequirementRow = {
  id: number;
  equipmentId: number;
  certificationId: number;
  equipment: { id: number; name: string; serialNumber: string | null };
  certification: {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
  };
};

export function fetchEquipmentTrainingRequirementsByEquipment(
  equipmentId: number
) {
  return apiGet<EquipmentTrainingRequirementRow[]>(
    `/equipment-training-requirements/equipment/${equipmentId}`
  );
}

export function createEquipmentTrainingRequirement(body: {
  equipmentId: number;
  certificationId: number;
}) {
  return apiPost<EquipmentTrainingRequirementRow>(
    "/equipment-training-requirements",
    body
  );
}

export function deleteEquipmentTrainingRequirement(id: number) {
  return apiDelete<{ status: string; deletedId: number }>(
    `/equipment-training-requirements/${id}`
  );
}

export function updateEquipmentTrainingRequirement(
  id: number,
  body: Partial<{ equipmentId: number; certificationId: number }>
) {
  return apiPatch<EquipmentTrainingRequirementRow>(
    `/equipment-training-requirements/${id}`,
    body
  );
}
