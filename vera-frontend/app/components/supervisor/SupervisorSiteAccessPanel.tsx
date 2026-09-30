"use client";

import { useEffect, useState } from "react";

export function SupervisorSiteAccessPanel() {
  const [accessList, setAccessList] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/site-access/today`
    );
    setAccessList(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 bg-gray-50 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Today's Site Access</h2>

      <ul className="space-y-2">
        {accessList.map((entry: any) => (
          <li
            key={entry.id}
            className="p-3 bg-white rounded shadow flex justify-between"
          >
            <span>{entry.worker?.name}</span>
            <span className="text-gray-500 text-sm">
              {entry.time.slice(0, 5)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
