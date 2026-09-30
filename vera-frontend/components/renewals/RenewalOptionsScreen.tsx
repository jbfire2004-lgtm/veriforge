"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bookRenewal,
  formatDeliveryMode,
  getVendorAvailability,
  type BookingSummary,
  type RenewalOptionItem,
  type VendorAvailability,
} from "@/lib/renewals-api";
import { DateTimePicker } from "@/components/renewals/DateTimePicker";

function slotKey(slot: VendorAvailability): string {
  return `${slot.vendorId}|${slot.date}|${slot.startTime}`;
}

export function RenewalOptionsScreen({
  workerId,
  item,
  onBooked,
  onBack,
}: {
  workerId: string;
  item: RenewalOptionItem;
  onBooked: (summary: BookingSummary) => void;
  onBack: () => void;
}) {
  const certType = useMemo(
    () => item.recommended?.certType ?? item.options[0]?.certType ?? "",
    [item],
  );

  const [options, setOptions] = useState<VendorAvailability[]>(item.options);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    item.recommended ? slotKey(item.recommended) : null,
  );
  const [date, setDate] = useState(item.recommended?.date ?? "");
  const [time, setTime] = useState(item.recommended?.startTime ?? "");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!certType) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getVendorAvailability(certType, workerId)
      .then((res) => {
        if (cancelled) return;
        setOptions(res.options);
        if (!selectedKey && res.recommended) {
          setSelectedKey(slotKey(res.recommended));
          setDate(res.recommended.date);
          setTime(res.recommended.startTime);
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load vendor availability"),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certType, workerId]);

  const selected = options.find((o) => slotKey(o) === selectedKey) ?? null;

  const handleSelect = useCallback((slot: VendorAvailability) => {
    setSelectedKey(slotKey(slot));
    setDate(slot.date);
    setTime(slot.startTime);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selected || !date || !time) return;
    setBooking(true);
    setError(null);
    try {
      const summary = await bookRenewal({
        workerId,
        certificationId: item.certificationId,
        vendorId: selected.vendorId,
        date,
        time,
      });
      onBooked(summary);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  }, [selected, date, time, workerId, item.certificationId, onBooked]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#247A78] hover:underline"
          >
            ← Back to renewals
          </button>
          <h2 className="mt-1 text-lg font-semibold text-[#2A2E33]">
            Renew {item.certificationName}
          </h2>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[#5a6b7c]">Loading vendor availability…</p>
      ) : options.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#2A2E33]/20 px-4 py-8 text-center text-sm text-[#5a6b7c]">
          No vendor availability found for this certification yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {options.map((slot) => {
            const active = slotKey(slot) === selectedKey;
            return (
              <li key={slotKey(slot)}>
                <button
                  type="button"
                  onClick={() => handleSelect(slot)}
                  className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-[#247A78] bg-[#E4F3F2]"
                      : "border-[#2A2E33]/10 bg-white hover:border-[#247A78]/40"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#2A2E33]">{slot.vendorId}</p>
                    <p className="mt-0.5 text-xs text-[#5a6b7c]">
                      {new Date(slot.date).toLocaleDateString()} · {slot.startTime}–
                      {slot.endTime} · {formatDeliveryMode(slot.deliveryMode)} ·{" "}
                      {slot.seatsAvailable} seat{slot.seatsAvailable === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2A2E33]">
                      ${slot.price.toFixed(2)}
                    </p>
                    {typeof slot.rating === "number" ? (
                      <p className="text-xs text-[#5a6b7c]">★ {slot.rating.toFixed(1)}</p>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected ? (
        <div className="space-y-4 rounded-xl border border-[#2A2E33]/10 bg-white p-4">
          <DateTimePicker
            date={date}
            time={time}
            onChange={(next) => {
              setDate(next.date);
              setTime(next.time);
            }}
          />
          <button
            type="button"
            disabled={booking || !date || !time}
            onClick={handleConfirm}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#247A78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2F8F8C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {booking ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
