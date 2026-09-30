"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { moduleLinkIcon } from "@/lib/navigation/module-link-icons";
import { WorkspaceSection } from "./WorkspaceSection";
import { cn } from "@/src/lib/utils";

export type ModuleLinkItem = {
  href: string;
  title: string;
  description: string;
};

type Props = {
  modules: readonly ModuleLinkItem[];
  sectionId?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  extraCards?: ReactNode;
  columns?: "two" | "three";
  className?: string;
};

const CARD_CLASS =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2F8F8C]/40 hover:shadow-md";

export function ModuleLinkGrid({
  modules,
  sectionId = "workspace-modules",
  sectionTitle = "Modules",
  sectionDescription,
  extraCards,
  columns = "two",
  className,
}: Props) {
  return (
    <WorkspaceSection
      id={sectionId}
      title={sectionTitle}
      description={sectionDescription}
      className={className}
    >
      <div
        className={cn(
          "grid gap-4",
          columns === "three"
            ? "sm:grid-cols-2 xl:grid-cols-3"
            : "sm:grid-cols-2",
        )}
      >
        {modules.map((mod) => {
          const Icon = moduleLinkIcon(mod.href);
          return (
            <Link key={mod.href} href={mod.href} className={CARD_CLASS}>
              <div
                className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#2F8F8C]/0 via-[#2F8F8C]/60 to-[#d97706]/50 opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              <div className="flex gap-4">
                <span
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A2E33] to-[#1e4a7a] text-white shadow-sm ring-1 ring-[#2A2E33]/10 transition group-hover:from-[#2F8F8C] group-hover:to-[#3AA39F]"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[#2A2E33] group-hover:text-[#2F8F8C]">
                    {mod.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5a6b7c]">
                    {mod.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
        {extraCards}
      </div>
    </WorkspaceSection>
  );
}
