"use client";

import { useEffect, useState } from "react";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { LogViewer } from "@/src/components/developer";
import { developerApi } from "@/lib/developer-api";

export default function DeveloperLogsPage() {
  const [items, setItems] = useState<
    {
      id: string;
      action: string;
      createdAt: string;
      developer?: { email: string } | null;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    developerApi
      .listLogs()
      .then((data) => setItems(data.items ?? []))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <DeveloperShell title="Global logs" description="Developer action audit trail.">
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <LogViewer items={items} />
    </DeveloperShell>
  );
}
