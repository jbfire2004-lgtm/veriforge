import { fetchTrendingPosts } from "@/lib/safety-blog/api";
import { PostCard } from "./PostCard";

export async function TrendingArticlesWidget({ limit = 4 }: { limit?: number }) {
  let posts: Awaited<ReturnType<typeof fetchTrendingPosts>> = [];
  try {
    posts = await fetchTrendingPosts(limit);
  } catch {
    return null;
  }
  if (!posts.length) return null;

  return (
    <section aria-labelledby="trending-heading" className="space-y-vera-4">
      <h2 id="trending-heading" className="text-lg font-semibold text-vera-deep">
        Trending articles
      </h2>
      <div className="grid gap-vera-4 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
