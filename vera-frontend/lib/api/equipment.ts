import { apiGet } from "@/lib/api";

export async function getEquipmentById(equipmentId: number) {
  return apiGet(`/equipment/${equipmentId}`);
}
