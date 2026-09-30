"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  VeriForgeMobileEmblem,
  VERIFORGE_MOBILE_BASE,
  veriforgeTypography,
} from "@/components/veriforge";
import { cn } from "@/src/lib/utils";

export default function VeriForgeMobileSplashPage() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(`${VERIFORGE_MOBILE_BASE}/auth/login`);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#1A1A1A] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30, 111, 184,.28),transparent_58%),linear-gradient(160deg,#1f1f1f_0%,#121212_45%,#0c0c0c_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-1/3 h-px bg-[linear-gradient(90deg,transparent,#1E6FB8,transparent)] opacity-70"
      />

      <div className="vf-mobile-fade-in relative z-10 flex flex-col items-center">
        <VeriForgeMobileEmblem />
        <h1
          className={cn(
            veriforgeTypography.heading,
            "vf-mobile-fade-up mt-8 text-2xl tracking-[0.18em] text-[#FAFAFA]",
          )}
          style={{ animationDelay: "180ms" }}
        >
          VERIFORGE
        </h1>
        <p
          className="vf-mobile-fade-up mt-3 text-center text-xs uppercase tracking-[0.16em] text-[#c8c8c8]"
          style={{ animationDelay: "320ms" }}
        >
          Forged-metal field operations
        </p>
        <div
          className="vf-mobile-fade-up mt-8 h-0.5 w-24 bg-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.7)]"
          style={{ animationDelay: "420ms" }}
        />
      </div>
    </div>
  );
}
