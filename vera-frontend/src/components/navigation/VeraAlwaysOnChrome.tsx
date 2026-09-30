"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { resolveSessionRole } from "@/lib/session-role";
import { Header } from "./VeraHeader";
import { ModuleHeader } from "./VeraModuleHeader";
import { UserMenu } from "@/src/components/layout/UserMenu";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";

type Props = {
  homeHref?: string;
  children: React.ReactNode;
};

/**
 * Unified Vera header + module bar without requiring a NextAuth session.
 * Tenant-only surfaces (VeriForge) still show Hub / Core / PM / FieldOS / VeriAgent.
 */
export function VeraAlwaysOnChrome({ homeHref = "/welcome", children }: Props) {
  const pathname = usePathname() ?? "/";
  const { data: session } = useSession();

  if (
    pathname.startsWith("/veriforge/auth") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/verihub/signup") ||
    pathname.startsWith("/client/login") ||
    pathname.startsWith("/client/signup") ||
    pathname.startsWith("/developer/login") ||
    pathname.startsWith("/developer/bootstrap")
  ) {
    return <>{children}</>;
  }

  const role = session?.user ? resolveSessionRole(session) : null;
  const displayName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Signed in";

  return (
    <div className="min-h-screen">
      <Header
        role={role}
        homeHref={homeHref}
        trailing={
          session?.user ? (
            <UserMenu
              name={displayName}
              email={session.user.email ?? null}
              role={role}
              menuLinks={buildAccountMenuLinks(role)}
            />
          ) : undefined
        }
      />
      <ModuleHeader role={role} />
      {children}
    </div>
  );
}
