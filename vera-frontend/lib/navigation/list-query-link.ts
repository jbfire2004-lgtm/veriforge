/** Build a query string for admin list pages (client-safe). */
export function mergeListSearchParams(
  current: URLSearchParams | string | null | undefined,
  extra: Record<string, string | number | undefined>,
): string {
  const next = new URLSearchParams(
    current == null ? "" : typeof current === "string" ? current : current.toString(),
  );
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined || v === "") next.delete(k);
    else next.set(k, String(v));
  }
  const qs = next.toString();
  return qs ? `?${qs}` : "";
}
