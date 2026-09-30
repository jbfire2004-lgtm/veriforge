import { SignCertificateClient } from "./SignCertificateClient";
import { Breadcrumbs } from "@/components/ui";

export default function SignCertificatePage() {
  return (
    <div className="p-vera-6 space-y-vera-6">
      <Breadcrumbs items={[{ label: "Sign certificates" }]} />
      <h1 className="text-2xl font-semibold">Sign digital certificate</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Instructors digitally sign issued certificates after training delivery.
      </p>
      <SignCertificateClient />
    </div>
  );
}
