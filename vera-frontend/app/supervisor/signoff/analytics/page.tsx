"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function SignoffAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await apiGet("/signoff/analytics");
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        Loading analytics…
      </div>
    );
  }

  const {
    total,
    safeCount,
    unsafeCount,
    checklistFailures,
    workerCount,
    equipmentCount,
    weeklyTrend,
  } = stats;

  return (
    <div className="p-6 bg-black text-white min-h-screen space-y-10 pb-24">
      <h1 className="text-3xl font-bold">Signoff Analytics</h1>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-900 rounded border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="p-4 bg-gray-900 rounded border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Safe</p>
          <p className="text-2xl font-bold text-green-400">{safeCount}</p>
        </div>

        <div className="p-4 bg-gray-900 rounded border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Unsafe</p>
          <p className="text-2xl font-bold text-red-400">{unsafeCount}</p>
        </div>
      </div>

      {/* Worker vs Equipment */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Signoff Distribution</h2>
        <p className="text-gray-300">Worker Signoffs: {workerCount}</p>
        <p className="text-gray-300">Equipment Signoffs: {equipmentCount}</p>
      </section>

      {/* Checklist Failures */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Checklist Failure Frequency</h2>

        {Object.entries(checklistFailures).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key}</span>
            <span className="text-red-400">{String(value)}</span>
          </div>
        ))}
      </section>

      {/* Weekly Trend */}
      <section className="p-4 bg-gray-900 rounded border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Weekly Trend</h2>

        <div className="space-y-1">
          {weeklyTrend.map((day: any, i: number) => (
            <div key={i} className="flex justify-between">
              <span>{day.label}</span>
              <span className="text-gray-300">{day.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
