"use client";

import { ModuleGrid } from "@/src/components/modules";
import type { ProductModuleRow } from "@/lib/subscription-api";

export function ModuleManagerForm({
  modules,
  busyCode,
  onToggle,
}: {
  modules: ProductModuleRow[];
  busyCode?: string | null;
  onToggle: (code: string, enabled: boolean) => void;
}) {
  return (
    <ModuleGrid modules={modules} busyCode={busyCode} onToggle={onToggle} />
  );
}
