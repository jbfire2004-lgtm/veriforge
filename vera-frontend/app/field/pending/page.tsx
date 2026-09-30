"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFieldMode } from "@/components/field/FieldModeProvider";
import type { SyncQueueItem } from "@/lib/field";
import { Button } from "@/components/ui/button";

export default function FieldPendingPage() {
  const { queue, syncNow, syncing } = useFieldMode();
  const [items, setItems] = useState<SyncQueueItem[]>([]);

  useEffect(() => {
    void queue.list().then(setItems);
  }, [queue, syncing]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pending sync</h1>
          <p className="text-sm text-muted-foreground">
            Actions queued while offline or waiting to retry.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={syncing} onClick={() => void syncNow()}>
          Sync now
        </Button>
      </header>
      <ul className="divide-y rounded-lg border">
        {items.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">Queue is empty.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2 p-4 text-sm">
              <span className="font-medium">{item.type}</span>
              <span className="text-muted-foreground">
                {item.status}
                {item.lastError ? ` — ${item.lastError}` : ""}
              </span>
            </li>
          ))
        )}
      </ul>
      <Link href="/field" className="text-sm text-teal-700 underline">
        Field dashboard
      </Link>
    </div>
  );
}
