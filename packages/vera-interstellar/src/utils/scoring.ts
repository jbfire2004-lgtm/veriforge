export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export const SYSTEM_DELAYS_YEARS: Record<string, number> = {
  sol: 0,
  alpha_centauri: 4.37,
  proxima: 4.24,
  trappist_1: 40,
};
