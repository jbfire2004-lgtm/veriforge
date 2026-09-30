"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { developerLogin } from "@/lib/developer-api";

export default function DeveloperLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await developerLogin(
        String(fd.get("email") || ""),
        String(fd.get("password") || ""),
      );
      router.push("/developer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DeveloperShell
      title="Developer sign in"
      description="Platform developers and support engineers."
      requireAuth={false}
    >
      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <label className="block space-y-1 text-sm">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-zinc-600">
          First account?{" "}
          <Link className="underline" href="/developer/bootstrap">
            Bootstrap developer
          </Link>
        </p>
      </form>
    </DeveloperShell>
  );
}
