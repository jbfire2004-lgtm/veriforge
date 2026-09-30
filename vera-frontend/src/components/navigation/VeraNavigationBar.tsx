"use client";

import { VeraGlobalNavDropdown } from "./VeraGlobalNavDropdown";
import { VeraModuleFeatureDropdown } from "./VeraModuleFeatureDropdown";

type Props = {
  role: string | null;
  className?: string;
};

/**
 * Official Vera navigation bar — global module switcher + module feature switcher.
 * Global dropdown is always visible; module dropdown appears only inside a module.
 */
export function VeraNavigationBar({ role, className }: Props) {
  return (
    <div
      className={`flex flex-wrap items-end gap-vera-4 border-b border-vera-charcoal/10 bg-vera-white px-vera-4 py-vera-3 sm:px-vera-6 ${className ?? ""}`}
      role="navigation"
      aria-label="Vera navigation"
    >
      <VeraGlobalNavDropdown role={role} />
      <VeraModuleFeatureDropdown role={role} />
    </div>
  );
}
