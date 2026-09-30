"use client";

import { useCallback, useEffect, useState } from "react";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { FeatureFlagToggle } from "@/src/components/developer";
import { developerApi } from "@/lib/developer-api";

export default function DeveloperFlagsPage() {
  const [flags, setFlags] = useState<
    { key: string; enabled: boolean; description?: string | null }[]
  >([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    developerApi
      .listFlags()
      .then((data) => setFlags(data.flags ?? []))
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function onToggle(key: string, enabled: boolean) {
    setBusy(key);
    setError(null);
    try {
      await developerApi.upsertFlag({ key, enabled });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <DeveloperShell
      title="Feature flags"
      description="Toggle platform feature flags."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ul className="space-y-2">
        {flags.map((flag) => (
          <li key={flag.key}>
            <FeatureFlagToggle
              flag={flag}
              busy={busy === flag.key}
              onToggle={onToggle}
            />
          </li>
        ))}
        {!flags.length ? (
          <li className="text-sm text-zinc-500">No flags yet.</li>
        ) : null}
      </ul>
    </DeveloperShell>
  );
}
