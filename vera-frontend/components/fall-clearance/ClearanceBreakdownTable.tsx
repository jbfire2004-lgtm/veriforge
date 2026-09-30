"use client";

import type { ClearanceBreakdown } from "./types";

export function ClearanceBreakdownTable({
  breakdown,
}: {
  breakdown: ClearanceBreakdown | null;
}) {
  if (!breakdown) return null;

  return (
    <table className="mt-2 w-full text-sm text-[var(--foreground)]">
      <caption className="sr-only">Clearance distance breakdown</caption>
      <tbody>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Free-fall</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.freeFallM.toFixed(2)} m
          </td>
        </tr>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Deceleration</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.decelerationM.toFixed(2)} m
          </td>
        </tr>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Harness stretch</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.harnessStretchM.toFixed(2)} m
          </td>
        </tr>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Lifeline payout</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.lifelinePayoutM.toFixed(2)} m
          </td>
        </tr>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Anchor deflection</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.anchorDeflectionM.toFixed(2)} m
          </td>
        </tr>
        <tr className="border-t border-[var(--border)]">
          <td className="py-1.5 pr-2">Safety margin</td>
          <td className="py-1.5 text-right tabular-nums">
            {breakdown.safetyMarginM.toFixed(2)} m
          </td>
        </tr>
      </tbody>
    </table>
  );
}
