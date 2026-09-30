"use client";

import type { SafetyBlogComment, SafetyBlogPostDetail } from "@vera/api-contract";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSafetyBlogComments,
  postSafetyBlogComment,
  upvoteComment,
} from "@/lib/safety-blog/api";
import { ReportDialog } from "@/components/moderation/ReportDialog";
import { buttonStyles } from "@/components/ui";

function CommentNode({
  comment,
  onReply,
  onUpvote,
}: {
  comment: SafetyBlogComment;
  onReply: (parentId: string) => void;
  onUpvote: (id: string) => void;
}) {
  return (
    <li className="space-y-vera-2 rounded-lg border border-vera-border/60 bg-white p-vera-3">
      <p className="text-sm">{comment.body}</p>
      <div className="flex flex-wrap gap-vera-3 text-xs text-vera-muted">
        <span>{comment.authorName ?? "Reader"}</span>
        <time>{new Date(comment.createdAt).toLocaleString()}</time>
        <button
          type="button"
          className="text-vera-teal hover:underline"
          onClick={() => onUpvote(comment.id)}
        >
          ▲ {comment.upvoteCount}
        </button>
        <button
          type="button"
          className="text-vera-teal hover:underline"
          onClick={() => onReply(comment.id)}
        >
          Reply
        </button>
        <ReportDialog
          target={{
            kind: "post",
            targetType: "SAFETY_COMMENT",
            targetId: comment.id,
            label: comment.body.slice(0, 80),
          }}
          triggerClassName="text-xs text-vera-muted hover:text-vera-teal"
        />
      </div>
      {comment.replies?.length ? (
        <ul className="ml-vera-4 space-y-vera-2 border-l border-vera-border pl-vera-3">
          {comment.replies.map((r) => (
            <CommentNode key={r.id} comment={r} onReply={onReply} onUpvote={onUpvote} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentSection({ post }: { post: SafetyBlogPostDetail }) {
  const [comments, setComments] = useState<SafetyBlogComment[]>([]);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>();
  const [voterKey] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : `v-${Date.now()}`,
  );

  const load = useCallback(async () => {
    const rows = await fetchSafetyBlogComments(post.slug);
    setComments(rows);
  }, [post.slug]);

  useEffect(() => {
    load().catch(() => setComments([]));
  }, [load]);

  const submit = async () => {
    if (!body.trim()) return;
    await postSafetyBlogComment({
      postId: post.id,
      parentId,
      authorName: authorName || undefined,
      body: body.trim(),
    });
    setBody("");
    setParentId(undefined);
    await load();
  };

  const handleUpvote = async (id: string) => {
    try {
      await upvoteComment(id, voterKey);
      await load();
    } catch {
      /* already voted */
    }
  };

  return (
    <section className="space-y-vera-4" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-lg font-semibold">
        Comments
      </h2>
      <div className="space-y-vera-2 rounded-xl border border-vera-border bg-white p-vera-4">
        <input
          className="w-full rounded border border-vera-border px-vera-3 py-vera-2 text-sm"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <textarea
          className="w-full rounded border border-vera-border px-vera-3 py-vera-2 text-sm min-h-[100px]"
          placeholder={parentId ? "Write a reply…" : "Share your experience…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {parentId ? (
          <button
            type="button"
            className="text-xs text-vera-muted hover:underline"
            onClick={() => setParentId(undefined)}
          >
            Cancel reply
          </button>
        ) : null}
        <button
          type="button"
          onClick={submit}
          className={buttonStyles({ variant: "primary", size: "sm" })}
        >
          Submit comment
        </button>
        <p className="text-xs text-vera-muted">Comments are moderated before appearing publicly.</p>
      </div>
      <ul className="space-y-vera-3">
        {comments.map((c) => (
          <CommentNode
            key={c.id}
            comment={c}
            onReply={setParentId}
            onUpvote={handleUpvote}
          />
        ))}
      </ul>
    </section>
  );
}
