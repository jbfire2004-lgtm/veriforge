import type { Metadata } from "next";
import { fetchSafetyBlogPosts } from "@/lib/safety-blog/api";
import { siteUrl } from "@/lib/safety-blog/seo";
import { PostCard } from "@/components/safety-blog/PostCard";
import { SearchForm } from "@/components/safety-blog/SearchForm";

export const metadata: Metadata = {
  title: "Search safety articles",
  alternates: { canonical: `${siteUrl()}/safety/search` },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SafetySearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const list = q
    ? await fetchSafetyBlogPosts({ q, pageSize: 24 }).catch(() => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 24,
      }))
    : { items: [], total: 0, page: 1, pageSize: 24 };

  return (
    <div className="space-y-vera-6">
      <header className="space-y-vera-4">
        <h1 className="text-2xl font-semibold text-vera-deep">Search</h1>
        <SearchForm initialQuery={q ?? ""} />
      </header>
      {q ? (
        <p className="text-sm text-vera-muted">
          {list.total} result{list.total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      ) : (
        <p className="text-sm text-vera-muted">Enter a topic to search articles.</p>
      )}
      <div className="grid gap-vera-4 md:grid-cols-2">
        {list.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
