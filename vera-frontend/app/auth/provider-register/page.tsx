import { ProviderRegisterClient } from "@/app/provider-portal/register/ProviderRegisterClient";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui";

export default function ProviderRegisterPage() {
  return (
    <div className="mx-auto max-w-2xl p-vera-6 space-y-vera-6">
      <Breadcrumbs items={[{ label: "Register training provider" }]} />
      <h1 className="text-2xl font-semibold">Provider onboarding</h1>
      <p className="text-sm text-muted-foreground">
        Create your accredited training provider profile. Company approval is required before issuing
        training to workers.
      </p>
      <ProviderRegisterClient />
      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/auth/provider-login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
