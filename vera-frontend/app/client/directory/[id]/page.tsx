"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HiringClientShell } from "@/src/components/client/HiringClientShell";
import { ContractorProfileView } from "@/src/components/contractor-directory";
import { DocumentList } from "@/src/components/document-center";
import { Button } from "@/components/ui";
import {
  getContractorDirectoryProfile,
  requestContractorConnection,
  type ContractorProfile,
} from "@/lib/contractor-directory-api";

export default function ClientDirectoryDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    getContractorDirectoryProfile(id)
      .then(setProfile)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function onConnect() {
    setBusy(true);
    setError(null);
    try {
      await requestContractorConnection(id);
      setProfile(await getContractorDirectoryProfile(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HiringClientShell
      title="Contractor profile"
      description="Directory profile, compliance, and connection status."
      actions={
        <div className="flex gap-2">
          <Link className="text-sm underline" href="/client/directory">
            Back to directory
          </Link>
          {profile && profile.connection?.status !== "approved" ? (
            <Button
              size="sm"
              disabled={busy || profile.connection?.status === "pending"}
              onClick={() => void onConnect()}
            >
              {profile.connection?.status === "pending"
                ? "Pending"
                : "Request connection"}
            </Button>
          ) : null}
        </div>
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {!profile ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="space-y-10">
          <ContractorProfileView profile={profile} />
          <DocumentList contractorId={id} canManage={false} />
        </div>
      )}
    </HiringClientShell>
  );
}
