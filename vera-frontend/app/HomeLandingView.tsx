import type { ReactNode } from "react";
import Link from "next/link";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "@/components/ui";
import { cn } from "@/src/lib/utils";

/**
 * Full-page navigation from the marketing home. Native anchors avoid cases where
 * App Router soft navigation appears to “do nothing” (e.g. stalled RSC / layout
 * transitions) while still matching button styling.
 */
function HomeNavAnchor({
  href,
  variant,
  size = "lg",
  children,
}: {
  href: string;
  variant: "default" | "secondary" | "ghost" | "destructive" | "outline" | "teal";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(buttonStyles({ variant, size }), "no-underline")}
    >
      {children}
    </a>
  );
}

type HomeLandingViewProps = {
  signedIn: boolean;
  role: string | null;
  adminEnabled: boolean;
  supervisorEnabled: boolean;
  userName: string | null;
};

export function HomeLandingView({
  signedIn,
  role,
  adminEnabled,
  supervisorEnabled,
  userName,
}: HomeLandingViewProps) {
  return (
    <main className="min-h-screen bg-vera-surface/40">
      <div className="mx-auto flex max-w-3xl flex-col gap-vera-8 px-vera-6 py-vera-16 md:py-vera-24">
        <Breadcrumbs
          className="text-vera-muted"
          items={[{ label: "VERA" }]}
        />

        <header className="space-y-vera-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-vera-teal">
            Workforce readiness & compliance
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-vera-deep md:text-5xl">
            VERA
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-vera-muted md:text-xl">
            {signedIn
              ? `Welcome back${userName ? `, ${userName}` : ""}. Jump straight into the surface you need.`
              : "Sign in for the admin console, then use VERA Core for training ingest, verification, and field workflows—all in one cohesive program view."}
          </p>
          {signedIn && role ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">
              Signed in as <span className="text-vera-deep">{role}</span>
            </p>
          ) : null}
        </header>

        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight">
              {signedIn ? "Where do you want to go?" : "Get started"}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {signedIn
                ? "Only sections your role can open are shown."
                : "Choose where you want to go next."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-vera-4 sm:flex-row sm:flex-wrap">
            {!signedIn ? (
              <HomeNavAnchor href="/auth/login" variant="default">
                Sign in
              </HomeNavAnchor>
            ) : null}

            {signedIn ? (
              <HomeNavAnchor href="/hub" variant="default">
                Vera Hub
              </HomeNavAnchor>
            ) : null}

            {signedIn ? (
              <HomeNavAnchor href="/dashboard" variant="outline">
                Workspace dashboard
              </HomeNavAnchor>
            ) : null}

            {adminEnabled ? (
              <HomeNavAnchor href="/admin" variant="outline">
                Admin console
              </HomeNavAnchor>
            ) : null}

            {supervisorEnabled ? (
              <HomeNavAnchor href="/supervisor" variant="teal">
                Supervisor home
              </HomeNavAnchor>
            ) : null}

            {signedIn ? (
              <HomeNavAnchor href="/wallet" variant="ghost">
                Worker wallet
              </HomeNavAnchor>
            ) : null}
          </CardContent>
        </Card>

        {signedIn ? null : (
          <Card className="border-vera-charcoal/10 shadow-sm">
            <CardHeader className="space-y-vera-2">
              <CardTitle className="text-xl tracking-tight">Built for the idea phase</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Clear hierarchy, generous spacing, and purpose-built surfaces so teams can
                move from pilot to production without visual drift.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-vera-4 sm:grid-cols-3">
              <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/60 p-vera-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Admin</p>
                <p className="mt-vera-2 text-sm font-medium leading-relaxed text-vera-charcoal">
                  Directory, training, and equipment in one control center.
                </p>
              </div>
              <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/60 p-vera-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Core</p>
                <p className="mt-vera-2 text-sm font-medium leading-relaxed text-vera-charcoal">
                  Ingest, verify, and retain evidence with audit-friendly flows.
                </p>
              </div>
              <div className="rounded-xl border border-vera-charcoal/10 bg-vera-surface/60 p-vera-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">Field</p>
                <p className="mt-vera-2 text-sm font-medium leading-relaxed text-vera-charcoal">
                  Supervisors scan, sign off, and report without leaving the floor.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-sm leading-relaxed text-vera-muted">
          If you use an old bookmark,{" "}
          <Link
            href="/login"
            className="font-semibold text-vera-deep underline-offset-4 hover:text-vera-teal hover:underline"
          >
            /login
          </Link>{" "}
          redirects to sign-in.
        </p>
      </div>
    </main>
  );
}
