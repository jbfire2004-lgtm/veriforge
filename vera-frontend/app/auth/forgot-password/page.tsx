"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api/phase-1-auth";
import { buttonStyles, Input, Label, Card, CardContent } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await requestPasswordReset(email);
      setMessage(
        res.resetUrl
          ? `Dev reset link: ${res.resetUrl}`
          : "If that email exists, a reset link was sent.",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
      <Card className="w-full">
        <CardContent className="space-y-4 pt-8">
          <h1 className="text-xl font-semibold">Reset password</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className={buttonStyles({ variant: "teal" })}
            >
              Send reset link
            </button>
          </form>
          {message && <p className="text-sm">{message}</p>}
          <Link href="/auth/login" className="text-sm text-teal-700 underline">
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
