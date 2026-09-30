export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export const COMM_DELAYS: Record<string, number> = {
  earth: 0,
  orbit: 0.5,
  moon: 1.3,
  mars: 22,
  deep_space: 40,
};
