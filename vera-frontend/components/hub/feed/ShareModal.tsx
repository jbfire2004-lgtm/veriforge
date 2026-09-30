"use client";

import type { FeedItemWithEngagement } from "@vera/api-contract";
import { useCallback, useState } from "react";
import { buttonStyles } from "@/components/ui";

type Props = {
  item: FeedItemWithEngagement | null;
  open: boolean;
  onClose: () => void;
};

export function ShareModal({ item, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && item?.url
      ? `${window.location.origin}${item.url}`
      : item?.url ?? "";

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!open || !item) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        aria-label="Close share"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-vera-border bg-vera-surface p-vera-5 shadow-xl"
        role="dialog"
        aria-labelledby="share-modal-title"
      >
        <h2 id="share-modal-title" className="text-base font-semibold mb-vera-2">
          Share
        </h2>
        <p className="text-sm text-vera-muted line-clamp-2 mb-vera-4">{item.title}</p>
        {shareUrl ? (
          <div className="flex gap-vera-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-md border border-vera-border bg-transparent px-vera-2 py-vera-2 text-xs"
            />
            <button
              type="button"
              onClick={copyLink}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-vera-muted">No link available for this item.</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className={`${buttonStyles({ variant: "outline", size: "sm" })} mt-vera-4 w-full`}
        >
          Done
        </button>
      </div>
    </>
  );
}
