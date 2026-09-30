"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function AdminError({
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
    <div className="mx-auto max-w-lg px-vera-4 py-vera-10 sm:px-vera-6">
      <ErrorState
        title="Admin area failed to load"
        description={error.message || "An unexpected error occurred in this section."}
      >
        <button type="button" onClick={() => reset()} className={buttonStyles({ variant: "default", size: "md" })}>
          Try again
        </button>
        <Link href="/admin" className={buttonStyles({ variant: "outline", size: "md" })}>
          Admin home
        </Link>
      </ErrorState>
    </div>
  );
}
