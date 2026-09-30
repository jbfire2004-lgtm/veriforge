import { redirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default async function VerifyQrRouterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string }> | { type?: string; id?: string };
}) {
  const sp = await Promise.resolve(searchParams);
  const type = sp.type;
  const id = sp.id;

  if (!type || !id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-vera-surface/80 to-vera-white px-vera-5 py-vera-12">
        <div className="mx-auto max-w-lg space-y-vera-8">
          <Breadcrumbs
            className="text-vera-muted"
            items={[{ label: "VERA", href: "/" }, { label: "Verify" }]}
          />
          <ErrorState
            title="Invalid QR link"
            description="This URL is missing type or id. Use a full VERA QR or open the scanner from the QR page."
          >
            <Link href="/qr" className={buttonStyles({ variant: "teal", className: "mt-vera-2" })}>
              Open QR scanner
            </Link>
          </ErrorState>
        </div>
      </div>
    );
  }

  const t = type.toLowerCase();

  switch (t) {
    case "worker":
      redirect(`/verify/${id}`);

    case "company":
      redirect(`/companies/${id}`);

    case "equipment":
      redirect(`/verify/equipment?id=${encodeURIComponent(id)}`);

    case "training":
      redirect(`/verify/core/training/${id}`);

    case "credential":
      redirect(`/verify/credential?id=${encodeURIComponent(id)}`);

    case "certificate":
      redirect(`/verify/certificate/${encodeURIComponent(id)}`);

    default:
      return (
        <div className="min-h-screen bg-gradient-to-b from-vera-surface/80 to-vera-white px-vera-5 py-vera-12">
          <div className="mx-auto max-w-lg space-y-vera-8">
            <Breadcrumbs
              className="text-vera-muted"
              items={[{ label: "VERA", href: "/" }, { label: "Verify" }]}
            />
            <Card className="border-vera-charcoal/10 shadow-md">
              <CardContent className="p-vera-8">
                <ErrorState
                  title="Unknown verification type"
                  description={`The QR type “${type}” is not supported. Supported types include worker, company, equipment, and training.`}
                >
                  <Link href="/qr" className={buttonStyles({ variant: "outline", className: "mt-vera-2" })}>
                    Back to scanner
                  </Link>
                </ErrorState>
              </CardContent>
            </Card>
          </div>
        </div>
      );
  }
}
