"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Props = {
  title: string;
  href: string;
  children: ReactNode;
  loading?: boolean;
};

export function HubWidgetShell({ title, href, children, loading }: Props) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
    );
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#2A2E33]">{title}</h3>
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-teal-700 hover:underline"
        >
          View
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </article>
  );
}
