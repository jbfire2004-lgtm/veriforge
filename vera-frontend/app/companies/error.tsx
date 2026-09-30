"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function CompaniesError({
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
        title="Companies could not be loaded"
        description={error.message || "Check your session and API, then try again."}
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
