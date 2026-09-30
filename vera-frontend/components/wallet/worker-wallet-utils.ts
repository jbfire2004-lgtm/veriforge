export type ExpiryTone = "good" | "soon" | "bad" | "none";

export function parseDate(d: string | Date | null | undefined): Date | null {
  if (d == null) return null;
  const x = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(x.getTime()) ? null : x;
}

/** Status for credentials / training relative to today (default 30-day warning window). */
export function getExpiryTone(
  expiresAt: Date | null,
  now = new Date(),
  warningDays = 30
): ExpiryTone {
  if (!expiresAt) return "none";
  if (expiresAt <= now) return "bad";
  const daysLeft = (expiresAt.getTime() - now.getTime()) / 86_400_000;
  if (daysLeft <= warningDays) return "soon";
  return "good";
}

export function toneLabel(tone: ExpiryTone): string {
  switch (tone) {
    case "good":
      return "Active";
    case "soon":
      return "Expiring soon";
    case "bad":
      return "Expired";
    default:
      return "No expiry";
  }
}

/**
 * Remaining validity as 0–100 for progress bar (time left in issued→expires window).
 */
export function validityProgressPercent(
  issuedAt: Date | null,
  expiresAt: Date | null,
  now = new Date()
): number {
  if (!expiresAt) return 100;
  const startMs = issuedAt?.getTime() ?? expiresAt.getTime() - 365 * 86_400_000;
  const endMs = expiresAt.getTime();
  const span = endMs - startMs;
  if (span <= 0) return expiresAt > now ? 100 : 0;
  const remaining = endMs - now.getTime();
  return Math.min(100, Math.max(0, (remaining / span) * 100));
}

export function formatShortDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(d: Date | null, now = new Date()): number | null {
  if (!d) return null;
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}
