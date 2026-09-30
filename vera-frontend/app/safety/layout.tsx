import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/safety-blog/seo";

export const metadata: Metadata = {
  title: {
    default: "Vera Safety Knowledge Hub",
    template: "%s | Vera Safety",
  },
  description:
    "Expert safety articles, field guides, and compliance insights for construction and industrial teams.",
  metadataBase: new URL(siteUrl()),
  alternates: { canonical: `${siteUrl()}/safety` },
  openGraph: {
    type: "website",
    title: "Vera Safety Knowledge Hub",
    description:
      "Expert safety articles, field guides, and compliance insights.",
    url: `${siteUrl()}/safety`,
  },
};

export default function SafetyBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-vera-surface text-vera-charcoal">
      <header className="border-b border-vera-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-vera-4 px-vera-4 py-vera-4 sm:px-vera-6">
          <Link href="/safety" className="text-lg font-semibold text-vera-deep no-underline">
            Vera Safety
          </Link>
          <nav className="flex flex-wrap gap-vera-4 text-sm">
            <Link href="/safety" className="text-vera-muted hover:text-vera-teal">
              Articles
            </Link>
            <Link href="/safety/search" className="text-vera-muted hover:text-vera-teal">
              Search
            </Link>
            <Link href="/hub" className="text-vera-muted hover:text-vera-teal">
              Hub
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-vera-4 py-vera-8 sm:px-vera-6">{children}</main>
    </div>
  );
}
