"use client";

import { useCallback, useEffect, useState } from "react";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { ContractorProfileView } from "@/src/components/contractor-directory";
import { DocumentList } from "@/src/components/document-center";
import { Button, Input } from "@/components/ui";
import {
  createContractorProfile,
  getContractorDirectoryProfile,
  listConnectionInbox,
  respondToConnection,
  type ContractorProfile,
} from "@/lib/contractor-directory-api";
import { getVeriHubSession } from "@/lib/verihub-org-api";

type InboxItem = {
  id: string;
  status: string;
  message?: string | null;
  hiringClient?: { companyName: string; contactEmail: string };
};

export default function VeriHubContractorDirectoryPage() {
  const session = getVeriHubSession();
  const orgId = session?.orgId;
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [legalName, setLegalName] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    try {
      const p = await getContractorDirectoryProfile(orgId);
      setProfile(p);
    } catch {
      setProfile(null);
    }
    try {
      const data = await listConnectionInbox();
      setInbox((data.items as InboxItem[]) ?? []);
    } catch {
      setInbox([]);
    }
  }, [orgId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createContractorProfile({
        legalName: legalName || session?.user?.email || "Contractor",
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRespond(id: string, decision: "approved" | "rejected") {
    setBusy(true);
    try {
      await respondToConnection(id, decision);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Respond failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VeriHubConsoleShell
      title="Contractor directory"
      description="Manage your public contractor profile and connection requests (Admin / Contractor)."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!profile ? (
        <form onSubmit={onCreate} className="mb-8 max-w-md space-y-3">
          <p className="text-sm text-zinc-600">
            No directory profile yet. Create one to appear in the hiring-client
            directory.
          </p>
          <Input
            placeholder="Legal name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            required
            minLength={2}
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create profile"}
          </Button>
        </form>
      ) : (
        <ContractorProfileView profile={profile} />
        <section className="mt-10">
          <DocumentList contractorId={orgId} canManage />
        </section>
      )}

      <section className="mt-10">
        <h3 className="mb-3 text-sm font-medium uppercase text-zinc-500">
          Connection requests
        </h3>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {inbox.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {row.hiringClient?.companyName ?? "Hiring client"}
                </p>
                <p className="text-xs text-zinc-500">
                  {row.hiringClient?.contactEmail} · {row.status}
                </p>
                {row.message ? (
                  <p className="mt-1 text-zinc-600">{row.message}</p>
                ) : null}
              </div>
              {row.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void onRespond(row.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void onRespond(row.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
          {!inbox.length ? (
            <li className="px-4 py-3 text-sm text-zinc-500">
              No connection requests.
            </li>
          ) : null}
        </ul>
      </section>
    </VeriHubConsoleShell>
  );
}
