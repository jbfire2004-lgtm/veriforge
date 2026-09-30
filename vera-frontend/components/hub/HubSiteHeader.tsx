"use client";

import { UserMenu } from "@/src/components/layout/UserMenu";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";
import { Header, ModuleHeader } from "@/src/components/navigation";

type Props = {
  role: string | null;
  userName?: string | null;
  userEmail?: string | null;
};

/** Hub chrome — flat industrial header stack (no consumer card shell). */
export function HubSiteHeader({ role, userName, userEmail }: Props) {
  return (
    <div className="sticky top-0 z-40 -mx-vera-4 mb-vera-6 sm:-mx-vera-6">
      <Header
        role={role}
        homeHref="/hub"
        trailing={
          <UserMenu
            name={userName?.trim() || "Signed in"}
            email={userEmail}
            role={role}
            menuLinks={buildAccountMenuLinks(role)}
            chrome="industrial"
          />
        }
      />
      <ModuleHeader role={role} />
    </div>
  );
}
