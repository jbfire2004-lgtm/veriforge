"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  ExternalLink,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import {
  fetchMyWorkerWallet,
  fetchWorkerWalletDownload,
  type WorkerWalletDownloadInfo,
} from "@/lib/worker-wallet-api";
import { cn } from "@/src/lib/utils";

type Props = {
  userName?: string | null;
  subscriptionLabel?: string | null;
  showAdminPanel: boolean;
};

export function HubWelcomeBanner({
  userName,
  subscriptionLabel,
  showAdminPanel,
}: Props) {
  const first = userName?.trim().split(/\s+/)[0] ?? "there";
  const [download, setDownload] = useState<WorkerWalletDownloadInfo | null>(null);
  const [walletHref, setWalletHref] = useState("/wallet");

  useEffect(() => {
    void fetchWorkerWalletDownload()
      .then(setDownload)
      .catch(() => null);
    void fetchMyWorkerWallet()
      .then((w) => {
        if (w.workerId) setWalletHref(`/wallet/${w.workerId}`);
      })
      .catch(() => null);
  }, []);

  const walletTarget = download?.pwaUrl ?? walletHref;

  return (
    <section
      aria-labelledby="hub-welcome-heading"
      className="overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-gradient-to-br from-[#2A2E33] via-[#134e4a] to-[#2F8F8C] p-6 text-white shadow-lg sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-200/90">
            Vera Hub
          </p>
          <h1 id="hub-welcome-heading" className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome back, {first}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-teal-100/90">
            Your daily command center — modules, readiness, and safety alerts in one place.
            {subscriptionLabel ? (
              <span className="mt-1 block font-medium text-white capitalize">
                Plan: {subscriptionLabel}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={walletTarget}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles({
                variant: "outline",
                size: "sm",
                className:
                  "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
              }),
            )}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download Worker Wallet
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
          </a>
          <Link
            href="/subscriptions"
            className={cn(
              buttonStyles({
                variant: "outline",
                size: "sm",
                className:
                  "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
              }),
            )}
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            Subscription & Billing
          </Link>
          {showAdminPanel ? (
            <Link
              href="/admin/acp"
              className={cn(
                buttonStyles({
                  size: "sm",
                  className: "gap-2 bg-white text-[#2A2E33] hover:bg-teal-50",
                }),
              )}
            >
              <Shield className="h-4 w-4" aria-hidden />
              Admin Control Panel
            </Link>
          ) : (
            <Link
              href="/welcome"
              className={cn(
                buttonStyles({
                  size: "sm",
                  className: "gap-2 bg-white text-[#2A2E33] hover:bg-teal-50",
                }),
              )}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              My workspace
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
