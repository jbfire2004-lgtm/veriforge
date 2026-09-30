import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/expert-qa/seo";

export const metadata: Metadata = {
  title: { default: "Vera Expert Q&A", template: "%s | Vera Experts" },
  description:
    "Ask safety and field questions. Get verified expert answers from construction and industrial professionals.",
  metadataBase: new URL(siteUrl()),
  alternates: { canonical: `${siteUrl()}/experts` },
};

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-vera-surface text-vera-charcoal">
      <header className="border-b border-vera-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-vera-4 px-vera-4 py-vera-4 sm:px-vera-6">
          <Link href="/experts" className="text-lg font-semibold text-vera-deep no-underline">
            Vera Experts
          </Link>
          <nav className="flex flex-wrap gap-vera-4 text-sm">
            <Link href="/experts" className="text-vera-muted hover:text-vera-teal">
              Questions
            </Link>
            <Link href="/experts/ask" className="text-vera-muted hover:text-vera-teal">
              Ask
            </Link>
            <Link href="/safety" className="text-vera-muted hover:text-vera-teal">
              Safety blog
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-vera-4 py-vera-8 sm:px-vera-6">{children}</main>
    </div>
  );
}
