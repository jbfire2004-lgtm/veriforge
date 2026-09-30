"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getRenewalOptions,
  type BookingSummary,
  type RenewalOptionItem,
} from "@/lib/renewals-api";
import { ExpiringSoonCard } from "@/components/renewals/ExpiringSoonCard";
import { RenewalOptionsScreen } from "@/components/renewals/RenewalOptionsScreen";
import { BookingConfirmationScreen } from "@/components/renewals/BookingConfirmationScreen";

type Stage =
  | { kind: "list" }
  | { kind: "options"; item: RenewalOptionItem }
  | { kind: "confirmed"; summary: BookingSummary };

export function RenewalsFlow({ workerId }: { workerId: string }) {
  const [items, setItems] = useState<RenewalOptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ kind: "list" });

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getRenewalOptions(workerId)
      .then((res) => setItems(res.items))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load renewals"),
      )
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (stage.kind === "options") {
    return (
      <RenewalOptionsScreen
        workerId={workerId}
        item={stage.item}
        onBack={() => setStage({ kind: "list" })}
        onBooked={(summary) => setStage({ kind: "confirmed", summary })}
      />
    );
  }

  if (stage.kind === "confirmed") {
    return (
      <BookingConfirmationScreen
        summary={stage.summary}
        onDone={() => {
          setStage({ kind: "list" });
          load();
        }}
      />
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold text-[#2A2E33]">Certification renewals</h1>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Book renewals for certifications that are expiring soon.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-[#5a6b7c]">Loading renewals…</p>
      ) : error ? (
        <div className="space-y-3 rounded-lg bg-red-50 px-4 py-3" role="alert">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={load}
            className="text-sm font-medium text-[#247A78] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#2A2E33]/20 px-4 py-10 text-center text-sm text-[#5a6b7c]">
          No certifications are expiring soon. You&apos;re all set.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ExpiringSoonCard
              key={item.certificationId}
              item={item}
              onRenew={(selected) => setStage({ kind: "options", item: selected })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
