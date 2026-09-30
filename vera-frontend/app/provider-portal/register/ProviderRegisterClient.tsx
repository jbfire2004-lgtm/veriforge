"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { buttonStyles } from "@/components/ui/button";

export function ProviderRegisterClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      await apiPost("/api/v1/training-providers/onboarding/provider", form);
      setMessage("Provider registered. Sign in to complete setup — approval is pending.");
      setTimeout(() => router.push("/auth/provider-login"), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Register training provider</h2>
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="School name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Provider code" value={form.code} onChange={(e) => set("code", e.target.value)} />
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Contact email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      <hr />
      <p className="text-xs text-muted-foreground">Admin account</p>
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Admin email" value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} required />
      <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Admin username" value={form.adminUsername} onChange={(e) => set("adminUsername", e.target.value)} required />
      <input className="w-full rounded border px-3 py-2 text-sm" type="password" placeholder="Admin password" value={form.adminPassword} onChange={(e) => set("adminPassword", e.target.value)} required />
      <button type="submit" className={buttonStyles({ variant: "teal" })} disabled={pending}>
        {pending ? "Registering…" : "Register"}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
