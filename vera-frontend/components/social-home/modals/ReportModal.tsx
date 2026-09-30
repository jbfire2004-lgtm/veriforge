"use client";

import { useState } from "react";
import { reportPost } from "@/lib/social-home/api";

export function ReportModal({
  open,
  onClose,
  postId,
}: {
  open: boolean;
  onClose: () => void;
  postId: string;
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Report post</h2>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3 w-full rounded-lg border p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          rows={4}
          placeholder="Describe the issue…"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-[3px] border border-[#2A2E33]/20 bg-transparent px-4 py-2 text-sm font-medium text-[#2A2E33] transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#F4F6F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-[3px] border border-[#A8842F] bg-[#C89F3D] px-4 py-2 text-sm font-semibold text-[#1C1A10] shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#B89136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
            onClick={() => {
              void reportPost(postId, reason).then(onClose);
            }}
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}
