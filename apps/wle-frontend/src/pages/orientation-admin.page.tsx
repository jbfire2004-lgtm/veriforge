import { useMemo, useState } from "react";
import { useWorkers } from "../hooks/use-workers";
import { useCompleteOrientation, useExpireOrientation } from "../hooks/use-orientation";

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

export function OrientationAdminPage() {
  const [query, setQuery] = useState("");
  const [orientationDate, setOrientationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: workers, isLoading, isError } = useWorkers();
  const completeOrientation = useCompleteOrientation();
  const expireOrientation = useExpireOrientation();

  const filteredWorkers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return workers ?? [];
    return (workers ?? []).filter((worker) => {
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
      return fullName.includes(value) || worker.companyId.toLowerCase().includes(value);
    });
  }, [workers, query]);

  const onComplete = async (workerId: string) => {
    setFeedback(null);
    setError(null);
    try {
      await completeOrientation.mutateAsync({
        workerId,
        date: new Date(`${orientationDate}T00:00:00.000Z`).toISOString(),
      });
      setFeedback("Orientation marked complete.");
    } catch {
      setError("Failed to mark orientation complete.");
    }
  };

  const onExpire = async (workerId: string) => {
    setFeedback(null);
    setError(null);
    try {
      await expireOrientation.mutateAsync(workerId);
      setFeedback("Orientation expired.");
    } catch {
      setError("Failed to expire orientation.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orientation Management</h1>

      <div className="rounded-xl border bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Search Worker (name/company)</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="e.g. Jane or COMP-001"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Orientation Date</span>
            <input
              type="date"
              value={orientationDate}
              onChange={(e) => setOrientationDate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
        </div>
      </div>

      {feedback && <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{feedback}</p>}
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {isLoading && <p className="rounded border bg-white p-4">Loading workers...</p>}
      {isError && <p className="rounded border bg-white p-4 text-red-600">Failed to load workers.</p>}

      <div className="space-y-3">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  {worker.firstName} {worker.lastName}
                </p>
                <p className="text-sm text-slate-600">Company: {worker.companyId}</p>
                <p className="text-sm text-slate-600">
                  Orientation: {worker.orientationStatus} ({formatDate(worker.orientationDate)})
                </p>
                <p className="text-sm text-slate-600">Lifecycle: {worker.lifecycleState}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onComplete(worker.id)}
                  disabled={completeOrientation.isPending}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Mark Orientation Complete
                </button>
                <button
                  onClick={() => onExpire(worker.id)}
                  disabled={expireOrientation.isPending}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Expire Orientation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
