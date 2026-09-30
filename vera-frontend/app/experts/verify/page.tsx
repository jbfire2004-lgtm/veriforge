"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyExpertVerification } from "@/lib/moderation/api";
import { buttonStyles } from "@/components/ui";

export default function ExpertVerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [tradeEvidence, setTradeEvidence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (status === "loading") {
    return <p className="text-sm text-vera-muted">Loading…</p>;
  }

  if (!session) {
    return (
      <p className="text-sm">
        <Link href="/auth/login?callbackUrl=/experts/verify" className="text-vera-teal hover:underline">
          Sign in
        </Link>{" "}
        to apply for expert verification.
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-vera-6">
      <header>
        <p className="text-sm">
          <Link href="/experts" className="text-vera-teal hover:underline">
            ← Experts
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-vera-deep mt-vera-2">
          Apply for expert verification
        </h1>
        <p className="text-sm text-vera-muted mt-vera-1">
          Verified experts can provide authoritative answers and earn reputation on Vera.
        </p>
      </header>
      <form
        className="space-y-vera-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            setError(null);
            try {
              await applyExpertVerification(session, {
                statement,
                tradeEvidence: tradeEvidence || undefined,
              });
              router.push("/experts");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not submit");
            }
          });
        }}
      >
        <label className="block text-sm">
          Why should you be verified? (min 20 characters)
          <textarea
            required
            minLength={20}
            className="mt-vera-1 w-full rounded-md border border-vera-border bg-transparent px-vera-3 py-vera-2 text-sm min-h-[120px]"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Trade credentials / evidence (optional)
          <textarea
            className="mt-vera-1 w-full rounded-md border border-vera-border bg-transparent px-vera-3 py-vera-2 text-sm min-h-[80px]"
            value={tradeEvidence}
            onChange={(e) => setTradeEvidence(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || statement.length < 20}
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
