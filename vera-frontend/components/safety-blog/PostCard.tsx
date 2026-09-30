import type { SafetyBlogPostSummary } from "@vera/api-contract";
import Link from "next/link";
import { RiskBadge } from "./RiskBadge";

export function PostCard({ post }: { post: SafetyBlogPostSummary }) {
  return (
    <article className="rounded-xl border border-vera-border bg-white p-vera-5 shadow-sm transition hover:border-vera-teal/40">
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt=""
          className="mb-vera-4 h-40 w-full rounded-lg object-cover"
        />
      ) : null}
      <div className="mb-vera-2 flex flex-wrap items-center gap-vera-2 text-xs text-vera-muted">
        <span className="uppercase tracking-wide">{post.category}</span>
        <RiskBadge level={post.safetyLevel} />
        {post.featured ? (
          <span className="rounded bg-vera-teal/10 px-2 py-0.5 text-vera-teal">Featured</span>
        ) : null}
      </div>
      <h2 className="text-lg font-semibold leading-snug">
        <Link href={`/safety/${post.slug}`} className="text-vera-deep hover:text-vera-teal no-underline">
          {post.title}
        </Link>
      </h2>
      {post.excerpt ? (
        <p className="mt-vera-2 line-clamp-3 text-sm text-vera-muted">{post.excerpt}</p>
      ) : null}
      <p className="mt-vera-3 text-xs text-vera-muted">
        {post.readMinutes} min read
        {post.authorName ? ` · ${post.authorName}` : ""}
      </p>
    </article>
  );
}
