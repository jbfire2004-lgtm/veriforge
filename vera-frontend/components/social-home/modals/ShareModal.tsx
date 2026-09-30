"use client";

import { sharePost } from "@/lib/social-home/api";

export function ShareModal({
  open,
  onClose,
  postId,
}: {
  open: boolean;
  onClose: () => void;
  postId: string;
}) {
  if (!open) return null;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/home?post=${postId}`
      : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Share post</h2>
        <p className="mt-2 break-all text-sm text-muted-foreground">{url}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="rounded-lg px-4 py-2 text-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="rounded-lg bg-vera-teal px-4 py-2 text-sm text-white"
            onClick={() => {
              void sharePost(postId);
              void navigator.clipboard?.writeText(url);
              onClose();
            }}
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
