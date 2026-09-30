"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, QrCode, RefreshCw } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import {
  fetchMyWorkerWallet,
  fetchWorkerWalletDownload,
  syncWorkerProfile,
  type WorkerWalletDownloadInfo,
} from "@/lib/worker-wallet-api";
import { cn } from "@/src/lib/utils";

export function HubWorkerWalletCard() {
  const [download, setDownload] = useState<WorkerWalletDownloadInfo | null>(null);
  const [workerId, setWorkerId] = useState<number | null>(null);
  const [qrContent, setQrContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchWorkerWalletDownload().catch(() => null),
      fetchMyWorkerWallet().catch(() => null),
    ])
      .then(([dl, wallet]) => {
        setDownload(dl);
        if (wallet?.workerId) {
          setWorkerId(wallet.workerId);
          setQrContent(wallet.qr?.content ?? null);
        }
      })
      .catch(() => setError("Could not load wallet info"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    if (!workerId) return;
    setSyncing(true);
    try {
      await syncWorkerProfile(workerId);
      const wallet = await fetchMyWorkerWallet();
      if (wallet.qr?.content) setQrContent(wallet.qr.content);
    } catch {
      setError("Sync failed — try again");
    } finally {
      setSyncing(false);
    }
  }

  const walletTarget = download?.pwaUrl ?? (workerId ? `/wallet/${workerId}` : "/wallet");

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-[6px] border border-[#2A2E33]/14 bg-[#F4F6F8]" />
    );
  }

  return (
    <section
      aria-labelledby="hub-wallet-heading"
      className="rounded-[6px] border border-[#2A2E33]/14 bg-white p-5 shadow-none"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            VeriWallet
          </p>
          <h2
            id="hub-wallet-heading"
            className="mt-1 text-lg font-semibold text-[#2A2E33]"
          >
            Worker credentials
          </h2>
          <p className="mt-1 text-sm text-[#5A6169]">
            {download?.description ??
              "Mobile credentials, training cards, and site access — plus verification credits at /wallet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={walletTarget}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles({
                size: "sm",
                className:
                  "gap-2 rounded-[3px] border border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8] shadow-none hover:bg-[#1A63A6]",
              }),
            )}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
            <ExternalLink className="h-3 w-3 opacity-80" aria-hidden />
          </a>
          {workerId ? (
            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={syncing}
              className={cn(
                buttonStyles({
                  variant: "outline",
                  size: "sm",
                  className:
                    "gap-2 rounded-[3px] border-[#2A2E33] bg-[#3B3F45] text-[#F4F6F8] shadow-none hover:bg-[#454A51]",
                }),
              )}
            >
              <RefreshCw
                className={cn("h-4 w-4", syncing && "animate-spin")}
                aria-hidden
              />
              Sync profile
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-[#C89F3D]" role="alert">
          {error}
        </p>
      ) : null}

      {workerId && qrContent ? (
        <div className="mt-4 flex items-center gap-4 rounded-[3px] border border-[#2A2E33]/12 bg-[#F4F6F8] p-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[3px] border border-[#2A2E33]/14 bg-white"
            aria-hidden
          >
            <QrCode className="h-10 w-10 text-[#2A2E33]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#2A2E33]">Your wallet QR</p>
            <p className="mt-1 truncate font-mono text-xs text-[#5A6169]">
              {qrContent}
            </p>
            <Link
              href={`/wallet/${workerId}`}
              className="mt-2 inline-block text-sm font-medium text-[#1E6FB8] hover:underline"
            >
              Open full wallet →
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#5A6169]">
          Link your worker profile to generate a site-access QR code.
        </p>
      )}

      {(download?.iosUrl || download?.androidUrl) && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {download.iosUrl ? (
            <a
              href={download.iosUrl}
              className="text-[#1E6FB8] hover:underline"
            >
              App Store
            </a>
          ) : null}
          {download.androidUrl ? (
            <a
              href={download.androidUrl}
              className="text-[#1E6FB8] hover:underline"
            >
              Google Play
            </a>
          ) : null}
        </div>
      )}
    </section>
  );
}
