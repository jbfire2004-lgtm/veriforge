"use client";

import Link from "next/link";
import { UserMenu } from "@/src/components/layout/UserMenu";
import { buildAccountMenuLinks } from "@/lib/navigation/account-nav";
import { buttonStyles } from "@/components/ui";
import { Header, ModuleHeader } from "@/src/components/navigation";

type Props = {
  signedIn?: boolean;
  role: string | null;
  userName?: string | null;
  userEmail?: string | null;
};

export function VeraHomeHeader({ signedIn, role, userName, userEmail }: Props) {
  const displayName = userName?.trim() || userEmail?.trim() || "Signed in";
  const menuLinks = buildAccountMenuLinks(role);

  if (signedIn) {
    return (
      <>
        <Header
          role={role}
          homeHref="/welcome"
          trailing={
            <UserMenu name={displayName} email={userEmail} menuLinks={menuLinks} />
          }
        />
        <ModuleHeader role={role} />
      </>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-vera-charcoal/10 bg-vera-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-vera-4 px-vera-4 py-vera-3 sm:px-vera-6">
        <Link
          href="/home"
          className="text-lg font-semibold tracking-tight text-vera-deep hover:text-vera-teal"
        >
          VERA
        </Link>
        <Link
          href="/auth/login?callbackUrl=/welcome"
          className={buttonStyles({ variant: "default", size: "sm" })}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
