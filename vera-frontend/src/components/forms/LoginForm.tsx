"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@/components/ui";
import { saveVeriHubSession } from "@/lib/verihub-org-api";

function isVeriHubConsoleTarget(path: string): boolean {
  const normalized = path.replace(/^\/vera/, "") || "/";
  return normalized === "/verihub" || normalized.startsWith("/verihub/");
}

/** Org login: workspace modules use NextAuth; VeriHub console uses SaaS `/api/auth/login`. */
export function LoginForm({ redirectTo = "/verihub" }: { redirectTo?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useSaasLogin = isVeriHubConsoleTarget(redirectTo);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    try {
      if (useSaasLogin) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Login failed",
          );
        }
        if (data.tokens?.accessToken && data.user?.orgId) {
          saveVeriHubSession({
            accessToken: data.tokens.accessToken,
            orgId: data.user.orgId,
            user: {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role,
            },
          });
        }
        router.push(redirectTo.replace(/^\/vera/, "") || "/verihub");
        return;
      }

      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        throw new Error(
          res?.error === "CredentialsSignin"
            ? "Invalid email or password"
            : res?.error ?? "Login failed",
        );
      }

      const target = redirectTo.replace(/^\/vera/, "") || "/hub";
      router.push(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
