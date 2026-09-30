"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

export default function EquipmentLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // SEARCH EQUIPMENT
  // ---------------------------------------------
  async function searchEquipment() {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const data = await apiGet(
        `/equipment/search?q=${encodeURIComponent(query)}`
      );
      setResults(data);
    } catch (err) {
      console.error("Equipment search failed", err);
    } finally {
      setLoading(false);
    }
  }

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(searchEquipment, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <main className="p-6 bg-black text-white min-h-screen space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-center">Equipment Lookup</h1>

      {/* Search Input */}
      <div>
        <input
          type="text"
          placeholder="Search by name, serial, or ID…"
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-400 text-sm">Searching…</p>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.length === 0 && query.trim() && !loading && (
          <p className="text-gray-500">No equipment found.</p>
        )}

        {results.map((eq) => (
          <a
            key={eq.id}
            href={`/supervisor/equipment/${eq.id}`}
            className="block p-4 bg-gray-900 rounded border border-gray-700 hover:bg-gray-800"
          >
            <p className="font-semibold">{eq.name}</p>

            <p className="text-xs text-gray-400">
              Serial: {eq.serialNumber || "N/A"}
            </p>

            <p className="text-xs text-gray-500">
              Status: {eq.isSafe ? "Safe" : "Unsafe"}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
