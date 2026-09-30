import Link from "next/link";
import { Compass } from "lucide-react";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "@/components/ui";

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen bg-vera-surface/40">
      <div className="mx-auto flex max-w-2xl flex-col gap-vera-8 px-vera-6 py-vera-16">
        <Breadcrumbs
          className="text-vera-muted"
          items={[{ label: "VERA", href: "/" }, { label: "Not found" }]}
        />

        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader className="space-y-vera-3">
            <div className="flex items-center gap-vera-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-vera-surface text-vera-deep">
                <Compass className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-xl tracking-tight">
                  We couldn&apos;t find that page
                </CardTitle>
                <CardDescription>
                  The URL is mistyped, the link is stale, or the page was renamed.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-vera-3">
            <Link href="/" className={buttonStyles({ variant: "outline", size: "md" })}>
              Back to home
            </Link>
            <Link
              href="/dashboard"
              className={buttonStyles({ variant: "default", size: "md" })}
            >
              Workspace dashboard
            </Link>
            <Link
              href="/qr"
              className={buttonStyles({ variant: "ghost", size: "md" })}
            >
              Open QR scanner
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
