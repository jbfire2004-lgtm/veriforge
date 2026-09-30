/**
 * Emergency quick-access pack — one-tap actions, contacts, muster, equipment, ERP steps.
 * Phones: 911 + verified utility catalog only (never invented).
 */

export type QuickAccessScenario =
  | "electrical"
  | "fall"
  | "trench"
  | "chemical"
  | "rollover"
  | "general";

export type ImmediateAction = {
  id: string;
  label: string;
  detail: string;
  kind: "call" | "radio" | "muster" | "aid" | "procedure" | "account";
  /** tel: target when kind=call */
  phone?: string;
  /** Scroll / focus target id for in-page jump */
  jumpTo?: string;
  priority: number;
};

export type QuickContact = {
  id: string;
  category: "public_safety" | "utility" | "site" | "company";
  name: string;
  role: string;
  phone: string | null;
  /** When phone is null — how to reach them */
  dialHint: string;
  notes?: string;
  verified: boolean;
};

export type MusterPoint = {
  id: string;
  name: string;
  description: string;
  primary: boolean;
};

export type EquipmentLocation = {
  id: string;
  name: string;
  location: string;
  qty?: number;
};

export type ErpProcedureStep = {
  order: number;
  title: string;
  detail: string;
};

export type EmergencyQuickAccessPack = {
  documentType: "EMERGENCY_QUICK_ACCESS";
  generatedAt: string;
  projectId: number;
  companyId: number;
  projectName: string;
  regionCode: string;
  scenario: QuickAccessScenario;
  siteAddress: string;
  radioChannel: string;
  immediateActions: ImmediateAction[];
  contacts: QuickContact[];
  /** Hazard-specific routing (gas→SaskEnergy, electrical→SaskPower/ATCO, release→OHS+fire) */
  hazardRouting: Array<{
    id: string;
    hazard: string;
    name: string;
    phone: string | null;
    reason: string;
    dialHint: string;
    priority: number;
  }>;
  musterPoints: MusterPoint[];
  equipment: EquipmentLocation[];
  procedures: ErpProcedureStep[];
  callScript: string;
  offline: {
    cacheKey: string;
    /** Hint shown in UI */
    guidance: string;
  };
};

export const QUICK_ACCESS_CACHE_PREFIX = "vera-emergency-quick-access";

export function quickAccessCacheKey(
  projectId: number,
  companyId: number,
): string {
  return `${QUICK_ACCESS_CACHE_PREFIX}:${projectId}:${companyId}`;
}
