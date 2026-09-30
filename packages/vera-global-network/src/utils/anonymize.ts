export function hashId(id: string | number, salt = "vera-network"): string {
  let h = 0;
  const s = `${salt}:${id}`;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `anon-${Math.abs(h).toString(36)}`;
}

export function aggregateHazardKeywords(texts: string[]): Map<string, number> {
  const map = new Map<string, number>();
  const keywords = [
    "fall",
    "height",
    "electrical",
    "confined",
    "chemical",
    "fire",
    "lift",
    "crane",
    "pressure",
    "thermal",
  ];
  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        map.set(kw, (map.get(kw) ?? 0) + 1);
      }
    }
  }
  return map;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
