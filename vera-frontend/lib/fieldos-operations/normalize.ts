/**
 * Normalize + anonymize field operations data.
 */

export const HOURS_DENOMINATOR = 200_000 as const;
export const MIN_SAMPLE = 5 as const;

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Opaque worker / equipment / site tokens — never raw IDs or PII. */
export function tokenizeFieldId(kind: "worker" | "equip" | "crew" | "site", raw: string): string {
  return `${kind}_${hash(raw)}`;
}

export function stripPii<T extends Record<string, unknown>>(raw: T): Omit<
  T,
  "workerName" | "badgeId" | "phone" | "email" | "siteAddress" | "equipmentSerial"
> {
  const {
    workerName: _w,
    badgeId: _b,
    phone: _p,
    email: _e,
    siteAddress: _s,
    equipmentSerial: _x,
    ...safe
  } = raw as T & {
    workerName?: string;
    badgeId?: string;
    phone?: string;
    email?: string;
    siteAddress?: string;
    equipmentSerial?: string;
  };
  void _w;
  void _b;
  void _p;
  void _e;
  void _s;
  void _x;
  return safe;
}
