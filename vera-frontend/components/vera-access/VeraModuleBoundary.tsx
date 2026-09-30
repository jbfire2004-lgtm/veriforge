"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useModuleAccess } from "@/lib/vera-access/use-module-access";

type Props = {
  moduleId: string;
  moduleName: string;
  children: ReactNode;
  /** Render children while the subscription check runs (server already gated the route). */
  optimistic?: boolean;
};

/** Blocks children when subscription / feature / permission denies module access. */
export function VeraModuleBoundary({
  moduleId,
  moduleName,
  children,
  optimistic = false,
}: Props) {
  const { allowed, loading, reason } = useModuleAccess(moduleId);

  if (loading) {
    if (optimistic) {
      return <>{children}</>;
    }
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Checking access…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <Sparkles className="mx-auto h-8 w-8 text-amber-600" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold text-[#2A2E33]">
          {moduleName} is not on your plan
        </h2>
        <p className="mt-2 text-sm text-[#5a6b7c]">
          {reason ?? "Upgrade your subscription or enable the required feature to continue."}
        </p>
        <Link
          href="/subscriptions"
          className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          View subscriptions
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
