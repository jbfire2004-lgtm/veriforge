import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { resolveSessionRole } from "@/lib/session-role";
import { VeraSignedInShell } from "./VeraSignedInShell";

export type SignedInVeraLayoutProps = {
  children: ReactNode;
  callbackUrl: string;
  homeHref?: string;
  contentClassName?: string;
};

/** Server layout wrapper — auth gate + unified global/module navigation. */
export async function SignedInVeraLayout({
  children,
  callbackUrl,
  homeHref,
  contentClassName,
}: SignedInVeraLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const role = resolveSessionRole(session);

  return (
    <main>
      <VeraSignedInShell
        role={role}
        userName={session.user?.name ?? null}
        userEmail={session.user?.email ?? null}
        homeHref={homeHref}
        contentClassName={contentClassName}
      >
        {children}
      </VeraSignedInShell>
    </main>
  );
}
