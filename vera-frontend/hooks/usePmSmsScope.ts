"use client";

import { usePmInspectionScope } from "@/hooks/usePmInspectionScope";

/** Session-aware company/project scope for Vera PM Safety Management System pages. */
export function usePmSmsScope(queryCompanyId = 1, queryProjectId = 1) {
  return usePmInspectionScope(queryCompanyId, queryProjectId);
}
