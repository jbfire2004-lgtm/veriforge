"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { createOrganization } from "@/lib/verihub-org-api";

export default function VeriHubSignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createOrganization({
        companyName: String(fd.get("companyName") || ""),
        ownerEmail: String(fd.get("ownerEmail") || ""),
        password: String(fd.get("password") || ""),
        ownerFirstName: String(fd.get("ownerFirstName") || "") || undefined,
        ownerLastName: String(fd.get("ownerLastName") || "") || undefined,
        industry: String(fd.get("industry") || "") || undefined,
        contactPhone: String(fd.get("contactPhone") || "") || undefined,
        selectedModules: ["verihub"],
        billingCycle: "monthly",
      });
      router.push("/verihub");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VeriHubConsoleShell
      title="Create organization"
      description="Provision a VeriForge organization with VeriHub enabled."
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span>First name</span>
            <input
              name="ownerFirstName"
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Last name</span>
            <input
              name="ownerLastName"
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span>Owner email</span>
          <input
            name="ownerEmail"
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
            minLength={12}
            className="w-full rounded border border-zinc-300 px-3 py-2"
          />
          <span className="text-xs text-zinc-500">
            12+ chars with upper, lower, digit, and symbol
          </span>
        </label>
        <label className="block space-y-1 text-sm">
          <span>Industry</span>
          <input
            name="industry"
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
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create organization"}
        </button>
      </form>
    </VeriHubConsoleShell>
  );
}
