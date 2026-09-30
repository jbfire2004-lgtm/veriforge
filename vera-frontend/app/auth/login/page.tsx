"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { LoginForm } from "@/src/components/forms/LoginForm";

export default function AuthLoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/verihub";

  return (
    <VeriHubConsoleShell
      title="Organization sign in"
      description="Sign in with your VeriForge organization account."
      requireAuth={false}
    >
      <LoginForm redirectTo={callbackUrl} />
      <p className="mt-4 text-sm text-zinc-600">
        Need an account?{" "}
        <Link className="underline" href="/verihub/signup">
          Register
        </Link>
      </p>
    </VeriHubConsoleShell>
  );
}
