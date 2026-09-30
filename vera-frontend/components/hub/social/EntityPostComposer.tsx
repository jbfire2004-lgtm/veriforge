"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { HubSurfaceCard } from "@/components/hub/HubSurfaceCard";
import { buttonStyles } from "@/components/ui";

type Props = {
  placeholder?: string;
  onPost: (body: string) => Promise<void>;
};

export function EntityPostComposer({ placeholder, onPost }: Props) {
  const { data: session } = useSession();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!session) return null;

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      try {
        await onPost(trimmed);
        setBody("");
      } catch {
        setError("Could not publish. Try again.");
      }
    });
  };

  return (
    <HubSurfaceCard className="p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">
        Post as page admin
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={10000}
        placeholder={placeholder ?? "Share a company or provider update…"}
        className="mt-3 w-full resize-y rounded-xl border border-[#2A2E33]/15 bg-white px-3 py-2 text-sm text-[#2A2E33] placeholder:text-[#94a3b8] focus:border-[#2F8F8C] focus:outline-none focus:ring-2 focus:ring-[#2F8F8C]/20"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={pending || !body.trim()}
          onClick={submit}
          className={buttonStyles({ variant: "primary", size: "sm" })}
        >
          {pending ? "Posting…" : "Publish"}
        </button>
      </div>
    </HubSurfaceCard>
  );
}
