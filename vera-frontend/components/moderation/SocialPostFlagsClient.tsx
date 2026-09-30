"use client";

import type { SocialPostModerationFlag } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useCallback, useState, useTransition } from "react";
import {
  adminResolveSocialFlag,
} from "@/lib/moderation/api";
import { buttonStyles } from "@/components/ui/button";

type Props = { initial: SocialPostModerationFlag[] };

export function SocialPostFlagsClient({ initial }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  const resolve = useCallback(
    (flagId: string, action: "DISMISS" | "HIDE_POST") => {
      if (!session) return;
      startTransition(async () => {
        await adminResolveSocialFlag(session, flagId, action);
        setItems((prev) => prev.filter((f) => f.id !== flagId));
      });
    },
    [session]
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-vera-muted">No open social post reports.</p>
    );
  }

  return (
    <ul className="space-y-vera-4">
      {items.map((flag) => (
        <li
          key={flag.id}
          className="rounded-lg border border-vera-border bg-vera-surface p-vera-4 text-sm"
        >
          <p className="font-medium text-vera-charcoal">
            {flag.post?.title ?? "Social post"} · {flag.post?.postType}
          </p>
          <p className="mt-vera-1 text-vera-muted line-clamp-3">
            {flag.post?.body}
          </p>
          <p className="mt-vera-2 text-xs text-vera-muted">
            Reported by @{flag.reporter.username} ·{" "}
            {new Date(flag.createdAt).toLocaleString()}
          </p>
          <p className="mt-vera-1">
            <span className="font-medium">Reason:</span> {flag.reason}
          </p>
          <div className="mt-vera-4 flex flex-wrap gap-vera-2">
            <button
              type="button"
              disabled={pending}
              className={buttonStyles({ variant: "outline", size: "sm" })}
              onClick={() => resolve(flag.id, "DISMISS")}
            >
              Dismiss
            </button>
            <button
              type="button"
              disabled={pending}
              className={buttonStyles({ variant: "destructive", size: "sm" })}
              onClick={() => resolve(flag.id, "HIDE_POST")}
            >
              Hide post
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
