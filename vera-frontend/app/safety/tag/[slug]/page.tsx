import type { Metadata } from "next";
import { fetchSafetyBlogPosts } from "@/lib/safety-blog/api";
import { siteUrl } from "@/lib/safety-blog/seo";
import { PostCard } from "@/components/safety-blog/PostCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `#${slug.replace(/-/g, " ")} · Safety articles`,
    alternates: { canonical: `${siteUrl()}/safety/tag/${slug}` },
  };
}

export default async function SafetyTagPage({ params }: Props) {
  const { slug } = await params;
  const list = await fetchSafetyBlogPosts({ tagSlug: slug, pageSize: 24 }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 24,
  }));

  return (
    <div className="space-y-vera-6">
      <header>
        <h1 className="text-2xl font-semibold text-vera-deep">#{slug.replace(/-/g, " ")}</h1>
        <p className="text-sm text-vera-muted">{list.total} articles</p>
      </header>
      <div className="grid gap-vera-4 md:grid-cols-2">
        {list.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
