"use client";

import { useState } from "react";
import type { SocialPostCard } from "@vera/api-contract";
import { BaseFeedCard } from "./BaseFeedCard";
import { MediaAttachmentViewer } from "./MediaAttachmentViewer";
import { PostLikes } from "./PostLikes";
import { PostComments } from "./PostComments";
import { ShareModal } from "../modals/ShareModal";
import { ReportModal } from "../modals/ReportModal";

type Legacy = {
  id: string;
  source: string;
  title: string;
  summary: string | null;
  url: string | null;
  publishedAt: string;
};

export function FeedPostCard({
  post,
  legacy,
}: {
  post?: SocialPostCard;
  legacy?: Legacy;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const id = post?.id ?? legacy?.id ?? "";
  const title = post?.title ?? legacy?.title ?? "Update";
  const body = post?.body ?? legacy?.summary ?? "";
  const subtitle = post
    ? `@${post.author.username} · ${new Date(post.publishedAt).toLocaleString()}`
  : `${legacy?.source ?? ""} · ${legacy?.publishedAt ? new Date(legacy.publishedAt).toLocaleString() : ""}`;

  return (
    <>
      <BaseFeedCard
        badge={post?.postType ?? legacy?.source}
        title={title}
        subtitle={subtitle}
        footer={
          post ? (
            <div className="flex flex-wrap items-center gap-vera-4">
              <PostLikes
                postId={post.id}
                count={post.engagement.likeCount}
                likedByMe={post.engagement.likedByMe}
              />
              <PostComments postId={post.id} count={post.engagement.commentCount} />
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShareOpen(true)}
              >
                Share
              </button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setReportOpen(true)}
              >
                Report
              </button>
            </div>
          ) : legacy?.url ? (
            <a href={legacy.url} className="text-sm font-medium text-vera-teal hover:underline">
              View details
            </a>
          ) : null
        }
      >
        <p className="whitespace-pre-wrap text-foreground/90">{body}</p>
        {post?.media?.length ? <MediaAttachmentViewer media={post.media} /> : null}
      </BaseFeedCard>
      {post ? (
        <>
          <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} postId={id} />
          <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} postId={id} />
        </>
      ) : null}
    </>
  );
}
