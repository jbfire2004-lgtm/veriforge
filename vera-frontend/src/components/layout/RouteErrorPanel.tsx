"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export type RouteErrorPanelProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  /** Where the "Back" link points. Defaults to "/". */
  homeHref?: string;
  homeLabel?: string;
};

/**
 * Shared boundary panel for `app/.../error.tsx` files. Logs the error to the
 * console (Next.js gives us the runtime error, including `digest` for server
 * errors) and offers a retry plus a way back to a known-good route.
 *
 * Every group-level `error.tsx` should render this so the chrome and language
 * stays consistent.
 */
export function RouteErrorPanel({
  error,
  reset,
  title = "Something went wrong",
  homeHref = "/",
  homeLabel = "Back",
}: RouteErrorPanelProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-vera-10">
      <ErrorState
        title={title}
        description={error.message || "This part of the app hit an unexpected error."}
      >
        <button
          type="button"
          onClick={() => reset()}
          className={buttonStyles({ variant: "teal", size: "md" })}
        >
          Try again
        </button>
        <Link
          href={homeHref}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          {homeLabel}
        </Link>
      </ErrorState>
    </div>
  );
}
