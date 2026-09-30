/**
 * Anonymize competency / training records — no PII in analytics.
 */

export const MIN_SAMPLE = 5 as const;
export const HOURS_DENOMINATOR = 200_000 as const;

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function tokenizeWorker(rawId: string): string {
  return `wrk_${hash(rawId)}`;
}

export function tokenizeCohort(rawId: string): string {
  return `coh_${hash(rawId)}`;
}

export function stripPii<T extends Record<string, unknown>>(raw: T): Omit<
  T,
  "workerName" | "email" | "badgeId" | "phone" | "employeeNumber"
> {
  const {
    workerName: _n,
    email: _e,
    badgeId: _b,
    phone: _p,
    employeeNumber: _emp,
    ...safe
  } = raw as T & {
    workerName?: string;
    email?: string;
    badgeId?: string;
    phone?: string;
    employeeNumber?: string;
  };
  void _n;
  void _e;
  void _b;
  void _p;
  void _emp;
  return safe;
}

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
