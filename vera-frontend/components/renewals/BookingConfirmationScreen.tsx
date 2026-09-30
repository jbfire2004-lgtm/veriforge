"use client";

import type { BookingSummary } from "@/lib/renewals-api";

export function BookingConfirmationScreen({
  summary,
  onDone,
}: {
  summary: BookingSummary;
  onDone: () => void;
}) {
  return (
    <section className="mx-auto max-w-md space-y-5 rounded-2xl border border-[#2A2E33]/10 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7] text-2xl text-[#15803d]">
        ✓
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#2A2E33]">Booking confirmed</h2>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Your {summary.certType} renewal is scheduled.
        </p>
      </div>

      <dl className="space-y-2 rounded-xl bg-[#f8fafc] p-4 text-left text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[#5a6b7c]">Status</dt>
          <dd className="font-medium text-[#2A2E33]">{summary.status}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#5a6b7c]">Vendor</dt>
          <dd className="font-medium text-[#2A2E33]">{summary.vendorId}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#5a6b7c]">When</dt>
          <dd className="font-medium text-[#2A2E33]">
            {new Date(summary.scheduledStart).toLocaleString()}
          </dd>
        </div>
        {summary.vendorConfirmationCode ? (
          <div className="flex justify-between gap-3">
            <dt className="text-[#5a6b7c]">Confirmation</dt>
            <dd className="font-mono font-medium text-[#2A2E33]">
              {summary.vendorConfirmationCode}
            </dd>
          </div>
        ) : null}
      </dl>

      <button
        type="button"
        onClick={onDone}
        className="inline-flex w-full items-center justify-center rounded-lg border border-[#247A78] px-4 py-2.5 text-sm font-semibold text-[#247A78] transition hover:bg-[#E4F3F2]"
      >
        Back to renewals
      </button>
    </section>
  );
}
