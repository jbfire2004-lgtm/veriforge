"use client";

import { useState } from "react";
import { commentOnPost } from "@/lib/social-home/api";

export function PostComments({ postId, count }: { postId: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  return (
    <div>
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        Comment · {count}
      </button>
      {open ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void commentOnPost(postId, text).then(() => {
              setText("");
              setOpen(false);
            });
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" className="rounded-lg bg-vera-teal px-3 py-2 text-sm text-white">
            Post
          </button>
        </form>
      ) : null}
    </div>
  );
}
