import { apiGet } from "@/lib/api";

export async function getEquipmentFull(equipmentId: number) {
  return apiGet(`/verify/equipment/${equipmentId}/full`);
}
