"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { askQuestion } from "@/lib/expert-qa/api";
import { buttonStyles } from "@/components/ui";

export function AskQuestionForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [trade, setTrade] = useState("");
  const [tags, setTags] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <p className="text-sm text-vera-muted">
        <a href="/auth/login?callbackUrl=/experts/ask" className="text-vera-teal hover:underline">
          Sign in
        </a>{" "}
        to ask a question.
      </p>
    );
  }

  return (
    <form
      className="max-w-2xl space-y-vera-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          const q = await askQuestion(session, {
            title: title.trim(),
            body: body.trim(),
            trade: trade.trim() || undefined,
            anonymous,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          });
          router.push(`/experts/questions/${q.slug}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to post question");
          setPending(false);
        }
      }}
    >
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="block text-sm font-medium">
        Title
        <input
          required
          minLength={10}
          className="mt-vera-1 w-full rounded-lg border border-vera-border px-vera-3 py-vera-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Details
        <textarea
          required
          minLength={20}
          className="mt-vera-1 w-full min-h-[200px] rounded-lg border border-vera-border px-vera-3 py-vera-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Trade (optional)
        <input
          className="mt-vera-1 w-full rounded-lg border border-vera-border px-vera-3 py-vera-2"
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Tags (comma-separated)
        <input
          className="mt-vera-1 w-full rounded-lg border border-vera-border px-vera-3 py-vera-2"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="fall-protection, scaffolding"
        />
      </label>
      <label className="flex items-center gap-vera-2 text-sm">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        Post anonymously
      </label>
      <p className="text-xs text-vera-muted">
        Attachments: add photo/PDF URLs in your question body for now, or use the upload API before submitting.
      </p>
      <button
        type="submit"
        disabled={pending}
        className={buttonStyles({ variant: "primary", size: "md" })}
      >
        {pending ? "Posting…" : "Post question"}
      </button>
    </form>
  );
}
