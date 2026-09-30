"use client";

import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { FallClearanceWorkspace } from "@/components/fall-clearance";

/**
 * Hub fall clearance page — flagship workspace (equipment + geometry + CSA basis).
 */
export function FallClearanceCalculator() {
  return (
    <CalculatorShell
      title="Fall clearance"
      description="Estimate required clearance vs available height for fall arrest systems. Select approved equipment, set geometry, and review PASS / WARNING / FAIL with standard basis."
      wide
    >
      <FallClearanceWorkspace />
    </CalculatorShell>
  );
}
