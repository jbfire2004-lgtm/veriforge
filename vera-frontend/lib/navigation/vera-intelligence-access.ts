import { canAccessAdminShell, isStaff, isWorker } from "@/lib/phase1-roles";

/** Company-scoped AI layers (Phases 5–16) — separate from day-to-day operations dashboard. */
export function canAccessVeraIntelligenceStack(role: string | null): boolean {
  return !isWorker(role) && isStaff(role) && canAccessAdminShell(role);
}
