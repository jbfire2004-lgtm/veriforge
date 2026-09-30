export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function hashId(id: string | number, salt = "vera-marketplace"): string {
  let h = 0;
  const s = `${salt}:${id}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `mkt-${Math.abs(h).toString(36)}`;
}
