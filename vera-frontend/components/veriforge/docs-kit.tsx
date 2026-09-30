"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { VeriForgeDivider, veriforgeTypography } from "./theme";
import { VeriForgeLogo } from "./logo";
import { vfForm, vfNav, vfSurface } from "./surfaces";

export type VeriForgeDocNavItem = {
  label: string;
  href: string;
};

export const VERIFORGE_DOCS_NAV: VeriForgeDocNavItem[] = [
  { label: "Getting Started", href: "/docs/getting-started" },
  { label: "Brand System", href: "/docs/brand-system" },
  { label: "Brand Story", href: "/docs/brand-story" },
  { label: "UI Components", href: "/docs/ui-components" },
  { label: "API", href: "/docs/api" },
  { label: "Database", href: "/docs/database" },
  { label: "Workflows", href: "/docs/workflows" },
  { label: "Onboarding", href: "/docs/onboarding" },
  { label: "Compliance", href: "/docs/compliance" },
  { label: "Training", href: "/docs/training" },
  { label: "Verification", href: "/docs/verification" },
  { label: "FAQ", href: "/docs/faq" },
];

export function VeriForgeDocsShell({
  children,
  navItems = VERIFORGE_DOCS_NAV,
  railLabel = "/docs",
  title = "Documentation System",
  subtitle = "Industrial Knowledge Rail",
  searchPlaceholder = "Search docs...",
}: {
  children: React.ReactNode;
  navItems?: VeriForgeDocNavItem[];
  railLabel?: string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
}) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const items = React.useMemo(
    () =>
      navItems.filter((item) =>
        item.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [navItems, query],
  );

  return (
    <div className="veriforge-theme min-h-screen bg-[#1C1F24] text-[#F4F6F8]">
      <div className="border-b border-[#5A6169] bg-[#2A2E33] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <VeriForgeLogo />
            <span
              className={cn(
                veriforgeTypography.heading,
                "text-xs font-semibold text-[#D5DBE0]",
              )}
            >
              {title}
            </span>
          </div>
          <span className="text-xs text-[#A8B0B8]">{subtitle}</span>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden w-80 shrink-0 border-r border-[#5A6169] bg-[#23272C] p-4 md:block">
          <p
            className={cn(
              veriforgeTypography.heading,
              "mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]",
            )}
          >
            {railLabel}
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn(vfForm.field, "mb-3")}
          />
          <VeriForgeDivider className="mb-3" />
          <nav className="space-y-1.5">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block",
                    vfNav.link,
                    active ? vfNav.linkActive : vfNav.linkIdle,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function VeriForgeDocTemplate({
  title,
  summary,
  version,
  lastUpdated,
  author,
  children,
}: {
  title: string;
  summary: string;
  version: string;
  lastUpdated: string;
  author: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-4">
      <header className={cn(vfSurface.panel, "p-4")}>
        <h1
          className={cn(
            veriforgeTypography.heading,
            "text-2xl font-semibold text-[#F4F6F8]",
          )}
        >
          {title}
        </h1>
        <div className="mt-2 h-0.5 w-28 bg-[#1E6FB8]" />
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[#D5DBE0]">
          {summary}
        </p>
        <div className="mt-3 grid gap-2 text-xs text-[#A8B0B8] md:grid-cols-3">
          <span>version: {version}</span>
          <span>last updated: {lastUpdated}</span>
          <span>author: {author}</span>
        </div>
      </header>
      {children}
    </article>
  );
}

export function VeriForgeDocSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(vfSurface.panel, "p-4")}>
      <h2
        className={cn(
          veriforgeTypography.heading,
          "text-sm font-semibold text-[#F4F6F8]",
        )}
      >
        {title}
      </h2>
      <div className="mt-2 h-px w-full bg-[#5A6169]/70" />
      <div className="mt-3 text-sm leading-relaxed text-[#D5DBE0]">{children}</div>
    </section>
  );
}

export function VeriForgeDocSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step) => (
        <li key={step} className="flex gap-2 text-sm text-[#D5DBE0]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1E6FB8]" />
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function VeriForgeCodeBlock({
  code,
  language = "txt",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="overflow-auto rounded-[3px] border border-[#5A6169] bg-[#23272C] p-3 text-xs text-[#F4F6F8]">
      <p className="mb-2 font-[var(--vf-font-primary)] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
        {language}
      </p>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

export function VeriForgeDiagram({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className={cn(vfSurface.inset, "p-3")}>
      <p
        className={cn(
          veriforgeTypography.heading,
          "mb-2 text-[11px] font-semibold text-[#D5DBE0]",
        )}
      >
        {title}
      </p>
      <div className="space-y-1 text-xs text-[#B8C0C8]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
