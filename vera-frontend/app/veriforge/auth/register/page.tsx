import Link from "next/link";

export default function VeriForgeRegisterPage() {
  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <h1 className="font-[var(--vf-font-primary)] text-xl font-bold uppercase tracking-[0.12em] text-[var(--vf-color-safety-white)]">
        Register
      </h1>
      <p className="text-sm text-[#d0d0d0]">
        New workers are created by an Admin who is already signed into that
        tenant. Open signup is disabled so a stranger cannot join a company by
        guessing its tenant id.
      </p>
      <p className="text-xs text-[#d0d0d0]">
        Sign in first, then have an Admin call{" "}
        <code>POST /veriforge/tenants/auth/register</code> with the session token.
      </p>
      <p className="text-xs text-[#d0d0d0]">
        Already have an account? <Link href="/veriforge/auth/login">Login</Link>
      </p>
    </div>
  );
}
