"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useHubAccess } from "@/lib/hub/use-hub-access";
import { hasAcpFeature, hasAcpPermission } from "@/lib/acp-access";

type Props = {
  permission?: string;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Hide children when ACP denies permission or feature. */
export function VeraAccessGate({
  permission,
  feature,
  children,
  fallback,
}: Props) {
  const { context, loading } = useHubAccess();

  if (loading) return null;

  if (permission && !hasAcpPermission(context, permission)) {
    return (
      fallback ?? (
        <p className="text-sm text-slate-500">
          Upgrade your plan to access this feature.{" "}
          <Link href="/subscriptions" className="text-teal-700 underline">
            View subscriptions
          </Link>
        </p>
      )
    );
  }

  if (feature && !hasAcpFeature(context, feature)) {
    return (
      fallback ?? (
        <p className="text-sm text-slate-500">
          This feature is not enabled for your organization.{" "}
          <Link href="/subscriptions" className="text-teal-700 underline">
            Enable in subscriptions
          </Link>
        </p>
      )
    );
  }

  return <>{children}</>;
}
