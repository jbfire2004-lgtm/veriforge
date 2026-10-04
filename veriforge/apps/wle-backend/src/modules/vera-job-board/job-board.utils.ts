export function slugifyJob(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

export function formatPayRange(
  payMin?: number | null,
  payMax?: number | null,
  payPeriod?: string | null,
  existing?: string | null,
): string | null {
  if (existing) return existing;
  if (payMin == null && payMax == null) return null;
  const period = payPeriod === 'annual' ? '/yr' : '/hr';
  if (payMin != null && payMax != null) return `$${payMin}–$${payMax}${period}`;
  if (payMin != null) return `From $${payMin}${period}`;
  if (payMax != null) return `Up to $${payMax}${period}`;
  return null;
}
