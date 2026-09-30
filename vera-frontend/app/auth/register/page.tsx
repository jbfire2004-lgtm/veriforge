"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { OrgCreateForm } from "@/src/components/forms";

export default function AuthRegisterPage() {
  const router = useRouter();

  return (
    <VeriHubConsoleShell
      title="Create organization"
      description="Provision a new VeriForge organization and owner account."
      requireAuth={false}
    >
      <OrgCreateForm onSuccess={() => router.push("/verihub")} />
      <p className="mt-4 text-sm text-zinc-600">
        Already registered?{" "}
        <Link className="underline" href="/auth/login">
          Sign in
        </Link>
      </p>
    </VeriHubConsoleShell>
  );
}
