"use client";

export function DateTimePicker({
  date,
  time,
  onChange,
}: {
  date: string;
  time: string;
  onChange: (next: { date: string; time: string }) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-[#2A2E33]">
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => onChange({ date: e.target.value, time })}
          className="rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm text-[#2A2E33] focus:border-[#247A78] focus:outline-none focus:ring-1 focus:ring-[#247A78]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-[#2A2E33]">
        Time
        <input
          type="time"
          value={time}
          onChange={(e) => onChange({ date, time: e.target.value })}
          className="rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm text-[#2A2E33] focus:border-[#247A78] focus:outline-none focus:ring-1 focus:ring-[#247A78]"
        />
      </label>
    </div>
  );
}
