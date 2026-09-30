"use client";

import Link from "next/link";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { ClientLoginForm } from "@/src/components/forms";

export default function AuthClientLoginPage() {
  return (
    <HiringClientShell
      title="Hiring client sign in"
      description="Review contractor scorecards and compliance before awarding work."
      requireAuth={false}
    >
      <ClientLoginForm />
      <p className="mt-4 text-sm text-zinc-600">
        New hiring client?{" "}
        <Link className="underline" href="/client/signup">
          Sign up
        </Link>
      </p>
    </HiringClientShell>
  );
}
