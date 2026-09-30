"use client";

import Link from "next/link";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { DeveloperLoginForm } from "@/src/components/forms";

export default function AuthDeveloperLoginPage() {
  return (
    <DeveloperShell
      title="Developer sign in"
      description="Platform developer and support console."
      requireAuth={false}
    >
      <DeveloperLoginForm />
      <p className="mt-4 text-sm text-zinc-600">
        First account?{" "}
        <Link className="underline" href="/developer/bootstrap">
          Bootstrap
        </Link>
      </p>
    </DeveloperShell>
  );
}
