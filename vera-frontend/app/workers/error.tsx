"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function WorkersError({
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
    <div className="mx-auto max-w-lg py-vera-10">
      <ErrorState
        title="Worker page failed"
        description={error.message || "Could not load this worker. The ID may be invalid or the API unreachable."}
      >
        <button type="button" onClick={() => reset()} className={buttonStyles({ variant: "teal", size: "md" })}>
          Try again
        </button>
        <Link href="/dashboard" className={buttonStyles({ variant: "outline", size: "md" })}>
          Dashboard
        </Link>
      </ErrorState>
    </div>
  );
}
