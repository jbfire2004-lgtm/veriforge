import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  canAccessSupervisorShell,
  isAdmin,
  isSupervisor,
  isProjectManager,
} from "@/lib/phase1-roles";
import { resolveSessionRole } from "@/lib/session-role";
import {
  Breadcrumbs,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "@/components/ui";

type SearchParams = { from?: string };

/** Default landing for users who hit a route their role can't access. */
export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const params = (await Promise.resolve(searchParams)) ?? {};
  const session = await getServerSession(authOptions);
  const role = resolveSessionRole(session);
  const fromRaw = typeof params.from === "string" ? params.from : "";
  const from = isSafeInternalPath(fromRaw) ? fromRaw : null;

  return (
    <main className="min-h-screen bg-vera-surface/40">
      <div className="mx-auto flex max-w-2xl flex-col gap-vera-8 px-vera-6 py-vera-16">
        <Breadcrumbs
          className="text-vera-muted"
          items={[{ label: "VERA", href: "/" }, { label: "Access denied" }]}
        />

        <Card className="border-vera-charcoal/10 shadow-md">
          <CardHeader className="space-y-vera-3">
            <div className="flex items-center gap-vera-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <ShieldOff className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-xl tracking-tight">
                  You don&apos;t have access to that page
                </CardTitle>
                <CardDescription>
                  Your current role
                  {role ? (
                    <>
                      {" "}(<span className="font-semibold">{role}</span>){" "}
                    </>
                  ) : (
                    " "
                  )}
                  can&apos;t open
                  {from ? (
                    <>
                      {" "}
                      <code className="rounded bg-vera-surface px-1 text-xs">{from}</code>
                    </>
                  ) : (
                    " this section"
                  )}
                  . Ask an admin to grant access, or use the links below.
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
            {canAccessSupervisorShell(role) &&
            (isSupervisor(role) || isProjectManager(role)) ? (
              <Link
                href="/supervisor"
                className={buttonStyles({ variant: "teal", size: "md" })}
              >
                Supervisor workspace
              </Link>
            ) : null}
            {isAdmin(role) ? (
              <Link
                href="/admin"
                className={buttonStyles({ variant: "teal", size: "md" })}
              >
                Admin console
              </Link>
            ) : null}
            <Link
              href="/auth/logout"
              className={buttonStyles({ variant: "ghost", size: "md" })}
            >
              Sign out
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function isSafeInternalPath(value: string): boolean {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  return true;
}
