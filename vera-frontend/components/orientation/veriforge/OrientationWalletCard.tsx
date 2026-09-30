"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { CompletionStatusBadge } from "./OrientationStatusBadges";

type Props = {
  orientationId: string;
  title?: string;
  companyLabel?: string | null;
  projectLabel?: string | null;
  status: string;
  deepLink?: string;
  qrPayload?: string;
  /** Tap target — player or completion details */
  href?: string;
  onOpen?: () => void;
};

export function OrientationWalletCard({
  orientationId,
  title,
  companyLabel,
  projectLabel,
  status,
  deepLink,
  qrPayload,
  href,
  onOpen,
}: Props) {
  const value = qrPayload || deepLink || orientationId;
  const context = [companyLabel, projectLabel].filter(Boolean).join(" · ");
  const target = href || deepLink;

  const inner = (
    <Card className="overflow-hidden transition-colors hover:border-[#2F8F8C]/45">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div
          className="mx-auto rounded-[3px] border border-[#2A2E33]/10 bg-white p-3 sm:mx-0"
          aria-hidden
        >
          <QRCodeSVG value={value} size={112} level="M" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          <CompletionStatusBadge status={status} />
          <h3 className="truncate text-base font-semibold text-[#1F2328]">
            {title || "Orientation"}
          </h3>
          {context ? (
            <p className="truncate text-sm text-[#2A2E33]/70">{context}</p>
          ) : (
            <p className="truncate text-xs text-[#2A2E33]/55">{orientationId}</p>
          )}
          <p className="text-xs text-[#2A2E33]/55">
            Tap to open orientation details
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (target) {
    return (
      <Link
        href={target}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F8F8C]"
        onClick={onOpen}
        aria-label={`Open ${title || "orientation"}`}
      >
        {inner}
      </Link>
    );
  }

  if (onOpen) {
    return (
      <button
        type="button"
        className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F8F8C]"
        onClick={onOpen}
        aria-label={`Open ${title || "orientation"}`}
      >
        {inner}
      </button>
    );
  }

  return inner;
}
