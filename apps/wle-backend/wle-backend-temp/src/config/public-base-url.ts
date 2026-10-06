/**
 * Canonical public browser URL for deep links, QR payloads, and emails.
 * @see docs/VERIFORGE-LOCAL-PORTS.md
 */
export const DEFAULT_PUBLIC_BASE_URL = "http://localhost:5175/vera";

export function resolvePublicBaseUrl(): string {
  return (
    process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    process.env.FRONTEND_URL?.replace(/\/$/, "") ||
    DEFAULT_PUBLIC_BASE_URL
  );
}
