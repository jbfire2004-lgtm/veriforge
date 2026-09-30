"use client";

import type { FeedItemWithEngagement } from "@vera/api-contract";
import type { SocialFeedComment } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { interactFeed } from "@/lib/hub/feed-api";
import { fetchSocialComments } from "@/lib/social/api";
import { buttonStyles } from "@/components/ui";

type Props = {
  item: FeedItemWithEngagement | null;
  open: boolean;
  onClose: () => void;
};

function CommentRow({
  comment,
  onReply,
}: {
  comment: SocialFeedComment;
  onReply: (parentId: string) => void;
}) {
  return (
    <li className="rounded-lg bg-vera-muted/10 px-vera-3 py-vera-2">
      <p className="text-xs font-medium text-vera-deep">
        {comment.authorName}
        {comment.authorUsername ? (
          <span className="text-vera-muted font-normal"> @{comment.authorUsername}</span>
        ) : null}
      </p>
      <p className="mt-vera-1">{comment.body}</p>
      <div className="mt-vera-2 flex items-center gap-vera-3 text-xs text-vera-muted">
        <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
        <button
          type="button"
          className="text-vera-teal hover:underline"
          onClick={() => onReply(comment.id)}
        >
          Reply
        </button>
        {(comment.replyCount ?? 0) > 0 ? (
          <span>{comment.replyCount} replies</span>
        ) : null}
      </div>
    </li>
  );
}

export function CommentDrawer({ item, open, onClose }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<SocialFeedComment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (!session || !item) return;
    fetchSocialComments(session, item.id).then(setComments).catch(() => setComments([]));
  }, [session, item]);

  useEffect(() => {
    if (!open || !item || !session) return;
    load();
  }, [open, item, session, load]);

  const submit = useCallback(() => {
    if (!session || !item || !text.trim()) return;
    startTransition(async () => {
      await interactFeed(session, {
        feedItemId: item.id,
        type: "COMMENT",
        body: text.trim(),
        parentId: replyTo ?? undefined,
      });
      setText("");
      setReplyTo(null);
      load();
    });
  }, [session, item, text, replyTo, load]);

  if (!open || !item) return null;

  const roots = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, SocialFeedComment[]>>((acc, c) => {
    if (c.parentId) {
      (acc[c.parentId] ??= []).push(c);
    }
    return acc;
  }, {});

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        aria-label="Close comments"
        onClick={onClose}
      />
      <aside
        className="fixed bottom-0 right-0 z-50 flex h-[min(70vh,520px)] w-full max-w-md flex-col rounded-t-xl border border-vera-border bg-vera-surface shadow-xl sm:right-vera-6 sm:bottom-vera-6 sm:rounded-xl"
        role="dialog"
        aria-labelledby="comment-drawer-title"
      >
        <header className="flex items-center justify-between border-b border-vera-border px-vera-4 py-vera-3">
          <h2 id="comment-drawer-title" className="text-sm font-semibold">
            Comments
          </h2>
          <button type="button" onClick={onClose} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Close
          </button>
        </header>
        <ul className="flex-1 overflow-y-auto px-vera-4 py-vera-3 space-y-vera-3 text-sm">
          {roots.length === 0 ? (
            <li className="text-vera-muted">No comments yet.</li>
          ) : (
            roots.map((c) => (
              <div key={c.id} className="space-y-vera-2">
                <CommentRow comment={c} onReply={setReplyTo} />
                {(repliesByParent[c.id] ?? []).map((r) => (
                  <div key={r.id} className="ml-vera-4 border-l-2 border-vera-border pl-vera-3">
                    <CommentRow comment={r} onReply={setReplyTo} />
                  </div>
                ))}
              </div>
            ))
          )}
        </ul>
        <footer className="border-t border-vera-border p-vera-4 space-y-vera-2">
          {replyTo ? (
            <p className="text-xs text-vera-muted">
              Replying…{" "}
              <button type="button" className="text-vera-teal" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </p>
          ) : null}
          <div className="flex gap-vera-2">
            <input
              className="flex-1 rounded-md border border-vera-border bg-transparent px-vera-3 py-vera-2 text-sm"
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button
              type="button"
              disabled={pending || !text.trim()}
              onClick={submit}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Post
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
