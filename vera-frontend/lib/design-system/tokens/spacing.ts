/**
 * Spacing scale — 4px grid (§3).
 */

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const cssSpaceVars = {
  1: "--space-1",
  2: "--space-2",
  3: "--space-3",
  4: "--space-4",
  5: "--space-5",
  6: "--space-6",
  8: "--space-8",
  10: "--space-10",
  12: "--space-12",
} as const;
