import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchSafetyBlogPost } from "@/lib/safety-blog/api";
import { articleJsonLd, postMetadata } from "@/lib/safety-blog/seo";
import { loadPageSeo, jsonLdScriptTag } from "@/lib/seo/page-seo";
import { RiskBadge } from "@/components/safety-blog/RiskBadge";
import { PostCard } from "@/components/safety-blog/PostCard";
import { CommentSection } from "@/components/safety-blog/CommentSection";
import { ArticleReportActions } from "@/components/moderation/ArticleReportActions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { metadata } = await loadPageSeo({ type: "ARTICLE", slug });
    return metadata;
  } catch {
    try {
      const post = await fetchSafetyBlogPost(slug);
      return postMetadata(post);
    } catch {
      return { title: "Article not found" };
    }
  }
}

export default async function SafetyArticlePage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await fetchSafetyBlogPost(slug);
  } catch {
    notFound();
  }

  let jsonLd: Record<string, unknown>;
  try {
    const seo = await loadPageSeo({ type: "ARTICLE", slug });
    jsonLd = seo.jsonLd as Record<string, unknown>;
  } catch {
    jsonLd = articleJsonLd(post) as Record<string, unknown>;
  }

  return (
    <article className="space-y-vera-8">
      {jsonLdScriptTag(jsonLd)}
      <header className="space-y-vera-3">
        <p className="text-sm uppercase tracking-wide text-vera-muted">{post.category}</p>
        <h1 className="text-3xl font-semibold leading-tight text-vera-deep">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-vera-3 text-sm text-vera-muted">
          <RiskBadge level={post.safetyLevel} />
          <span>{post.readMinutes} min read</span>
          {post.authorName ? <span>{post.authorName}</span> : null}
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
          <ArticleReportActions articleId={post.id} title={post.title} />
        </div>
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="w-full rounded-xl object-cover max-h-96" />
        ) : null}
      </header>

      <div
        className="prose prose-vera max-w-none text-vera-charcoal"
        dangerouslySetInnerHTML={{
          __html: post.body?.replace(/\n/g, "<br />") ?? post.excerpt ?? "",
        }}
      />

      {post.tags.length > 0 ? (
        <nav className="flex flex-wrap gap-vera-2" aria-label="Tags">
          {post.tags.map((t) => (
            <Link
              key={t.id}
              href={`/safety/tag/${t.slug}`}
              className="rounded-full bg-vera-muted/10 px-vera-3 py-vera-1 text-xs text-vera-muted hover:text-vera-teal no-underline"
            >
              #{t.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {post.relatedPosts.length > 0 ? (
        <section className="space-y-vera-4">
          <h2 className="text-xl font-semibold">Related articles</h2>
          <div className="grid gap-vera-4 sm:grid-cols-2">
            {post.relatedPosts.map((r) => (
              <PostCard key={r.id} post={r} />
            ))}
          </div>
        </section>
      ) : null}

      <CommentSection post={post} />
    </article>
  );
}
