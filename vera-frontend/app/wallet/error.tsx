"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function WalletError({
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
        title="Wallet section error"
        description={error.message || "This part of the app hit an unexpected error."}
      >
        <button type="button" onClick={() => reset()} className={buttonStyles({ variant: "teal", size: "md" })}>
          Try again
        </button>
        <Link href="/wallet" className={buttonStyles({ variant: "outline", size: "md" })}>
          Enter worker ID
        </Link>
      </ErrorState>
    </div>
  );
}
