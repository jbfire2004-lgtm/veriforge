import Link from "next/link";
import {
  fetchSafetyBlogCategories,
  fetchSafetyBlogPosts,
} from "@/lib/safety-blog/api";
import { PostCard } from "@/components/safety-blog/PostCard";
import { SearchForm } from "@/components/safety-blog/SearchForm";
import { TrendingArticlesWidget } from "@/components/safety-blog/TrendingArticlesWidget";

export default async function SafetyBlogIndexPage() {
  const [list, categories] = await Promise.all([
    fetchSafetyBlogPosts({ pageSize: 12, featured: undefined }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
    })),
    fetchSafetyBlogCategories().catch(() => []),
  ]);

  const featured = list.items.filter((p) => p.featured);
  const rest = list.items.filter((p) => !p.featured);

  return (
    <div className="space-y-vera-10">
      <header className="space-y-vera-4">
        <h1 className="text-3xl font-semibold tracking-tight text-vera-deep">
          Safety Knowledge Hub
        </h1>
        <p className="max-w-2xl text-vera-muted">
          Field-tested guides, expert answers, and compliance insights for crews, supervisors, and safety leaders.
        </p>
        <SearchForm />
      </header>

      {categories.length > 0 ? (
        <nav aria-label="Categories" className="flex flex-wrap gap-vera-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/safety/category/${c.slug}`}
              className="rounded-full border border-vera-border px-vera-3 py-vera-1 text-sm text-vera-muted hover:border-vera-teal hover:text-vera-teal no-underline"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <TrendingArticlesWidget />

      {featured.length > 0 ? (
        <section className="space-y-vera-4">
          <h2 className="text-xl font-semibold">Featured</h2>
          <div className="grid gap-vera-4 md:grid-cols-2">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-vera-4">
        <h2 className="text-xl font-semibold">Latest articles</h2>
        <div className="grid gap-vera-4 md:grid-cols-2">
          {(rest.length ? rest : list.items).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
