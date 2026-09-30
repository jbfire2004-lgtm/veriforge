"use client";

import type { SafetyBlogPostDetail } from "@vera/api-contract";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminDeletePost, adminSavePost } from "@/lib/safety-blog/api";
import { buttonStyles } from "@/components/ui";

type Props = {
  session: Session;
  post?: SafetyBlogPostDetail;
};

export function SafetyBlogEditor({ session, post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [authorName, setAuthorName] = useState(post?.authorName ?? "");
  const [safetyLevel, setSafetyLevel] = useState(post?.safetyLevel ?? "MEDIUM");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "PUBLISHED",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setPending(true);
    setError(null);
    try {
      const saved = await adminSavePost(
        session,
        {
          title,
          body,
          excerpt: excerpt || undefined,
          metaDescription: metaDescription || undefined,
          authorName: authorName || undefined,
          safetyLevel,
          featured,
          status,
        },
        post?.id,
      );
      router.push(`/admin/safety-blog/${saved.id}/edit`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!post?.id || !confirm("Delete this article?")) return;
    await adminDeletePost(session, post.id);
    router.push("/admin/safety-blog");
  };

  return (
    <div className="max-w-3xl space-y-vera-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="block text-sm font-medium">
        Title
        <input
          className="mt-vera-1 w-full rounded border border-vera-border px-vera-3 py-vera-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Body
        <textarea
          className="mt-vera-1 w-full min-h-[280px] rounded border border-vera-border px-vera-3 py-vera-2 font-mono text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Excerpt
        <textarea
          className="mt-vera-1 w-full rounded border border-vera-border px-vera-3 py-vera-2 text-sm"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Meta description (SEO)
        <input
          className="mt-vera-1 w-full rounded border border-vera-border px-vera-3 py-vera-2 text-sm"
          value={metaDescription}
          maxLength={320}
          onChange={(e) => setMetaDescription(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Author
        <input
          className="mt-vera-1 w-full rounded border border-vera-border px-vera-3 py-vera-2"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-vera-4">
        <label className="text-sm">
          Safety level
          <select
            className="ml-vera-2 rounded border border-vera-border px-vera-2 py-vera-1"
            value={safetyLevel}
            onChange={(e) => setSafetyLevel(e.target.value as typeof safetyLevel)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="text-sm">
          Status
          <select
            className="ml-vera-2 rounded border border-vera-border px-vera-2 py-vera-1"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <label className="flex items-center gap-vera-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
      </div>
      <div className="flex flex-wrap gap-vera-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {post?.slug ? (
          <a
            href={`/safety/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Preview
          </a>
        ) : null}
        {post?.id ? (
          <button
            type="button"
            onClick={remove}
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
