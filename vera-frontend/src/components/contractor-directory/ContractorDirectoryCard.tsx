"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import {
  ComplianceBadge,
  ConnectionStatusBadge,
  InsuranceBadge,
  SafetyRatingStars,
} from "./ComplianceBadge";
import type { ContractorListItem } from "@/lib/contractor-directory-api";

export function ContractorDirectoryCard({
  contractor,
  hrefBase = "/client/directory",
  onConnect,
  connectBusy,
}: {
  contractor: ContractorListItem;
  hrefBase?: string;
  onConnect?: (id: string) => void;
  connectBusy?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">
            <Link
              className="underline-offset-2 hover:underline"
              href={`${hrefBase}/${contractor.contractorId}`}
            >
              {contractor.tradeName || contractor.legalName}
            </Link>
          </CardTitle>
          {contractor.tradeName ? (
            <p className="text-xs text-zinc-500">{contractor.legalName}</p>
          ) : null}
        </div>
        <ConnectionStatusBadge status={contractor.connectionStatus} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <ComplianceBadge score={contractor.complianceScore} />
          <InsuranceBadge status={contractor.insuranceStatus} />
        </div>
        <SafetyRatingStars rating={contractor.safetyRating} />
        <p className="text-xs text-zinc-600">
          {[contractor.industry, contractor.region].filter(Boolean).join(" · ") ||
            "—"}
        </p>
        {onConnect && contractor.connectionStatus !== "approved" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={connectBusy || contractor.connectionStatus === "pending"}
            onClick={() => onConnect(contractor.contractorId)}
          >
            {contractor.connectionStatus === "pending"
              ? "Request pending"
              : "Request connection"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
