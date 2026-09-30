"use client";

import { ContentContainer, Header, ModuleHeader } from "@/src/components/navigation";
import { UserMenu } from "./UserMenu";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";

export type VeraSignedInShellProps = {
  role: string | null;
  userName?: string | null;
  userEmail?: string | null;
  /** Logo link target — defaults to /welcome */
  homeHref?: string;
  children: React.ReactNode;
  /** Max width for content area */
  contentClassName?: string;
};

/**
 * Lightweight authenticated chrome: global header + module bar + content.
 * Use for hub, welcome, weather, and other signed-in surfaces that do not need
 * full VeraAppShell breadcrumbs or field mode chrome.
 */
export function VeraSignedInShell({
  role,
  userName,
  userEmail,
  homeHref = "/welcome",
  children,
}: VeraSignedInShellProps) {
  const displayName = userName?.trim() || userEmail?.trim() || "Signed in";

  return (
    <div className="vera-shell-bg min-h-screen">
      <Header
        role={role}
        homeHref={homeHref}
        trailing={
          <UserMenu
            name={displayName}
            email={userEmail ?? null}
            role={role}
            menuLinks={buildAccountMenuLinks(role)}
            chrome="industrial"
          />
        }
      />
      <ModuleHeader role={role} />
      <ContentContainer size="narrow" className="max-w-6xl">
        {children}
      </ContentContainer>
    </div>
  );
}
