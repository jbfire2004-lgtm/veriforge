import { apiGet } from "@/lib/api";

export async function getWorker(workerId: number) {
  return apiGet(`/workers/${workerId}`);
}
