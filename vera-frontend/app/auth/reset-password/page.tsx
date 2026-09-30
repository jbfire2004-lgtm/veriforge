"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/phase-1-auth";
import { buttonStyles, Input, Label, Card, CardContent } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setMessage("Missing reset token in URL");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      setMessage("Password updated. You can sign in now.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-8">
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className={buttonStyles({ variant: "teal" })}
          >
            Update password
          </button>
        </form>
        {message && <p className="text-sm">{message}</p>}
        <Link href="/auth/login" className="text-sm text-teal-700 underline">
          Sign in
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
