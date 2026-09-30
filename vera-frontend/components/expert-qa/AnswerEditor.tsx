"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAnswer } from "@/lib/expert-qa/api";
import { buttonStyles } from "@/components/ui";

export function AnswerEditor({ questionId }: { questionId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  if (!session) {
    return (
      <p className="text-sm text-vera-muted">
        <a href="/auth/login" className="text-vera-teal hover:underline">
          Sign in
        </a>{" "}
        to post an answer.
      </p>
    );
  }

  return (
    <div className="space-y-vera-3 rounded-xl border border-vera-border bg-white p-vera-4">
      <h3 className="font-semibold text-sm">Your answer</h3>
      <textarea
        className="w-full min-h-[140px] rounded-lg border border-vera-border px-vera-3 py-vera-2 text-sm"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share field experience, code references, or step-by-step guidance…"
      />
      <button
        type="button"
        disabled={pending || body.trim().length < 10}
        onClick={async () => {
          setPending(true);
          await postAnswer(session, questionId, body.trim());
          setBody("");
          router.refresh();
          setPending(false);
        }}
        className={buttonStyles({ variant: "primary", size: "md" })}
      >
        {pending ? "Posting…" : "Post answer"}
      </button>
    </div>
  );
}
