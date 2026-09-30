"use client";

import { FormEvent, useEffect, useState } from "react";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { developerApi, developerCan } from "@/lib/developer-api";

export default function DeveloperApiKeysPage() {
  const [keys, setKeys] = useState<
    { id: string; name: string; keyPrefix: string; revokedAt: string | null }[]
  >([]);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);

  async function reload() {
    const data = await developerApi.listApiKeys();
    setKeys(data.keys ?? []);
  }

  useEffect(() => {
    setAllowed(developerCan("api_keys.manage"));
    reload().catch((err: Error) => setError(err.message));
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSecret(null);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await developerApi.createApiKey(
        String(fd.get("name") || ""),
      );
      setSecret(result.secret);
      e.currentTarget.reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function onRevoke(id: string) {
    try {
      await developerApi.revokeApiKey(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <DeveloperShell
      title="API keys"
      description="Manage developer API keys for automation."
    >
      {!allowed ? (
        <p className="text-sm text-zinc-600">
          Requires api_keys.manage (SystemAdmin / ModuleArchitect).
        </p>
      ) : (
        <>
          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
          {secret ? (
            <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
              New key secret (copy now):{" "}
              <span className="font-mono">{secret}</span>
            </p>
          ) : null}
          <form onSubmit={onCreate} className="mb-6 flex gap-2">
            <input
              name="name"
              required
              placeholder="Key name"
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              Create
            </button>
          </form>
          <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white text-sm">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="font-mono text-xs text-zinc-500">
                    {k.keyPrefix}…
                  </p>
                </div>
                {k.revokedAt ? (
                  <span className="text-xs text-zinc-500">Revoked</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRevoke(k.id)}
                    className="rounded border border-zinc-300 px-3 py-1.5"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </DeveloperShell>
  );
}
