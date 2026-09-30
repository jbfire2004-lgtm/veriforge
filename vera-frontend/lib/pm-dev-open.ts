/**
 * Local-only PM / Inspections testing without NextAuth.
 * Requires NEXT_PUBLIC_VERA_PM_DEV_OPEN=1 and never applies in production builds.
 */
export function isVeraPmDevOpen(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const flag = process.env.NEXT_PUBLIC_VERA_PM_DEV_OPEN?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

/** Synthetic session shape for server layouts when PM dev-open is enabled. */
export function veraPmDevOpenSession(): {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: number;
    companyName: string;
  };
  accessToken?: undefined;
  expires: string;
} {
  const companyIdRaw = Number(process.env.NEXT_PUBLIC_VERA_PM_DEV_COMPANY_ID ?? "1");
  const companyId =
    Number.isFinite(companyIdRaw) && companyIdRaw > 0 ? companyIdRaw : 1;
  return {
    user: {
      id: "1",
      email: "dev-open@vera.local",
      name: "Dev Open",
      role: "SUPER_ADMIN",
      companyId,
      companyName: "Dev Open Company",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
