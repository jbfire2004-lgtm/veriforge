"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/hub", label: "Vera Hub" },
  { href: "/jobs", label: "Jobs" },
  { href: "/safety", label: "Safety blog" },
  { href: "/wallet", label: "VeriWallet" },
];

export function LeftNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 text-sm">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "block rounded-lg px-3 py-2 font-medium transition-colors",
            pathname === l.href
              ? "bg-vera-teal/10 text-vera-teal"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
