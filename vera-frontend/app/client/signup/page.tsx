"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { hiringClientSignup } from "@/lib/hiring-client-api";

export default function ClientSignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await hiringClientSignup({
        companyName: String(fd.get("companyName") || ""),
        contactName: String(fd.get("contactName") || ""),
        contactEmail: String(fd.get("contactEmail") || ""),
        contactPhone: String(fd.get("contactPhone") || "") || undefined,
        password: String(fd.get("password") || ""),
      });
      router.push("/client/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HiringClientShell
      title="Create hiring client account"
      description="For EPCs, owners, municipalities, and general contractors."
      requireAuth={false}
    >
      <form onSubmit={onSubmit} className="max-w-lg space-y-4">
        <label className="block space-y-1 text-sm">
          <span>Company name</span>
          <input
            name="companyName"
            required
            minLength={2}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Contact name</span>
          <input
            name="contactName"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Contact email</span>
          <input
            name="contactEmail"
            type="email"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Contact phone</span>
          <input
            name="contactPhone"
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={12}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
          <span className="text-xs text-zinc-500">
            12+ chars with upper, lower, digit, and symbol
          </span>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-zinc-600">
          Already registered?{" "}
          <Link className="underline" href="/client/login">
            Sign in
          </Link>
        </p>
      </form>
    </HiringClientShell>
  );
}
