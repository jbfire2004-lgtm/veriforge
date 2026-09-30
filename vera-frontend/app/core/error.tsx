"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function CoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-vera-4 py-vera-12">
      <ErrorState
        title="VERA Core — something went wrong"
        description={error.message || "This Core page failed to render."}
      >
        <button type="button" onClick={() => reset()} className={buttonStyles({ variant: "teal", size: "md" })}>
          Try again
        </button>
        <Link href="/core" className={buttonStyles({ variant: "outline", size: "md" })}>
          Core home
        </Link>
      </ErrorState>
    </div>
  );
}
