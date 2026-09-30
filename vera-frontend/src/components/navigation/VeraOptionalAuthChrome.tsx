"use client";

import { useSession } from "next-auth/react";
import { resolveSessionRole } from "@/lib/session-role";
import { Header, ModuleHeader } from "@/src/components/navigation";
import { UserMenu } from "@/src/components/layout/UserMenu";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";

type Props = {
  homeHref?: string;
  children: React.ReactNode;
};

/**
 * Renders unified navigation when the user is signed in; otherwise passes children through.
 * Use on hybrid public/authenticated routes (e.g. job board).
 */
export function VeraOptionalAuthChrome({ homeHref = "/hub", children }: Props) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-[40vh]" aria-busy="true" />;
  }

  if (!session?.user) {
    return <>{children}</>;
  }

  const role = resolveSessionRole(session);
  const displayName = session.user.name?.trim() || session.user.email?.trim() || "Signed in";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-[#f4f7fa] to-[#E4F3F2]/50">
      <Header
        role={role}
        homeHref={homeHref}
        trailing={
          <UserMenu
            name={displayName}
            email={session.user.email ?? null}
            role={role}
            menuLinks={buildAccountMenuLinks(role)}
          />
        }
      />
      <ModuleHeader role={role} />
      {children}
    </div>
  );
}
