import { apiFetchJson } from "@/lib/api-fetch";
import type { EquipmentProfile } from "./types";
import type { ClearanceParams } from "@/lib/veripm-work-at-heights/types";

const BASE = "/api/v1/fall-clearance";

/** @deprecated Use Work at Heights worksheet at /pm/work-at-heights/clearance */
export async function listFallEquipment(): Promise<EquipmentProfile[]> {
  const data = await apiFetchJson<EquipmentProfile[] | { items?: EquipmentProfile[] }>(
    `${BASE}/equipment`,
  );
  return Array.isArray(data) ? data : data.items ?? [];
}

/** @deprecated PASS/FAIL calculate removed — use saveClearanceWorksheet */
export async function calculateFallClearance(_config: unknown): Promise<never> {
  throw new Error(
    "Authoritative clearance calculation was removed. Use the Work at Heights clearance worksheet at /pm/work-at-heights/clearance.",
  );
}

export type { ClearanceParams };
