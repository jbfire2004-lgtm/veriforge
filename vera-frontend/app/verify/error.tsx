"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function VerifyError({
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
        title="Verification page error"
        description={error.message || "Something went wrong while loading this verification view."}
      >
        <button type="button" onClick={() => reset()} className={buttonStyles({ variant: "teal", size: "md" })}>
          Try again
        </button>
        <Link href="/qr" className={buttonStyles({ variant: "outline", size: "md" })}>
          QR scanner
        </Link>
      </ErrorState>
    </div>
  );
}
