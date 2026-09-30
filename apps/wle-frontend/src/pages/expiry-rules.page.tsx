import { useEffect, useState } from "react";
import { useRules, useUpdateRules } from "../hooks/use-rules";
import { ExpiryRules } from "../types";

export function ExpiryRulesPage() {
  const { data, isLoading, isError } = useRules();
  const updateRules = useUpdateRules();
  const [form, setForm] = useState<ExpiryRules>({
    orientationExpiryDays: 90,
    certificationExpiryDays: 365,
    notSeenDays: 30,
    autoDeactivate: true,
    autoNotify: true,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async () => {
    await updateRules.mutateAsync(form);
  };

  if (isLoading) return <p className="rounded border bg-white p-4">Loading rules...</p>;
  if (isError) return <p className="rounded border bg-white p-4 text-red-600">Failed to load rules.</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Expiry Rule Editor</h1>
      <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-4 md:grid-cols-2 md:p-6">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Orientation Expiry Days</span>
          <input
            className="w-full rounded border px-3 py-2"
            type="number"
            min={1}
            value={form.orientationExpiryDays}
            onChange={(e) => setForm({ ...form, orientationExpiryDays: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Certification Expiry Days</span>
          <input
            className="w-full rounded border px-3 py-2"
            type="number"
            min={1}
            value={form.certificationExpiryDays}
            onChange={(e) => setForm({ ...form, certificationExpiryDays: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Not Seen Days</span>
          <input
            className="w-full rounded border px-3 py-2"
            type="number"
            min={1}
            value={form.notSeenDays}
            onChange={(e) => setForm({ ...form, notSeenDays: Number(e.target.value) })}
          />
        </label>
        <div className="space-y-3 self-end text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.autoDeactivate}
              onChange={(e) => setForm({ ...form, autoDeactivate: e.target.checked })}
            />
            <span>Auto Deactivate</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.autoNotify}
              onChange={(e) => setForm({ ...form, autoNotify: e.target.checked })}
            />
            <span>Auto Notify</span>
          </label>
        </div>
      </div>
      <button
        onClick={save}
        disabled={updateRules.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {updateRules.isPending ? "Saving..." : "Save Rules"}
      </button>
      {updateRules.isSuccess && <p className="text-sm text-green-700">Rules saved successfully.</p>}
      {updateRules.isError && <p className="text-sm text-red-700">Failed to save rules.</p>}
    </div>
  );
}
