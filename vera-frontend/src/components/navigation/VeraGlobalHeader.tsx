"use client";

import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { ThemeToggle } from "@/components/theme";
import { VeraGlobalNavDropdown } from "./VeraGlobalNavDropdown";
import { VeraPrimaryProductRail } from "./VeraPrimaryProductRail";
import { navChrome } from "./nav-chrome";

type Props = {
  role: string | null;
  homeHref?: string;
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Global header — industrial slate top bar.
 * Layer 1 of the official Vera page layout.
 */
export function VeraGlobalHeader({
  role,
  homeHref = "/dashboard",
  trailing,
  className,
}: Props) {
  return (
    <header className={cn(navChrome.topBar, className)}>
      <div className={navChrome.topBarInner}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href={homeHref} className={navChrome.brand} aria-label="Vera home">
            VERA
          </Link>
          <span className={navChrome.divider} aria-hidden />
          <VeraGlobalNavDropdown role={role} variant="header" className="shrink-0" />
        </div>

        <VeraPrimaryProductRail role={role} />

        <div className={navChrome.trailing}>
          <ThemeToggle className={cn("border-0 bg-transparent shadow-none", navChrome.ghostOnDark)} />
          {trailing}
        </div>
      </div>
    </header>
  );
}
