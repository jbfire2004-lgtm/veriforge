"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { developerBootstrap } from "@/lib/developer-api";

export default function DeveloperBootstrapPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await developerBootstrap({
        email: String(fd.get("email") || ""),
        password: String(fd.get("password") || ""),
        role: String(fd.get("role") || "SystemAdmin"),
        fullName: String(fd.get("fullName") || "") || undefined,
        bootstrapSecret:
          String(fd.get("bootstrapSecret") || "") || undefined,
      });
      router.push("/developer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bootstrap failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DeveloperShell
      title="Bootstrap developer"
      description="Create a platform developer account. After the first user, DEVELOPER_BOOTSTRAP_SECRET is required."
      requireAuth={false}
    >
      <form onSubmit={onSubmit} className="max-w-lg space-y-4">
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
          <span>Full name</span>
          <input
            name="fullName"
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Role</span>
          <select
            name="role"
            defaultValue="SystemAdmin"
            className="w-full rounded border border-zinc-300 px-3 py-2"
          >
            <option value="SystemAdmin">SystemAdmin</option>
            <option value="ModuleArchitect">ModuleArchitect</option>
            <option value="SupportEngineer">SupportEngineer</option>
            <option value="BillingAdmin">BillingAdmin</option>
          </select>
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
        </label>
        <label className="block space-y-1 text-sm">
          <span>Bootstrap secret</span>
          <input
            name="bootstrapSecret"
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create developer"}
        </button>
        <p className="text-sm text-zinc-600">
          <Link className="underline" href="/developer/login">
            Sign in
          </Link>
        </p>
      </form>
    </DeveloperShell>
  );
}
