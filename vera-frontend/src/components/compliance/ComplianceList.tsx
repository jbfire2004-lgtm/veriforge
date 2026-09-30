"use client";

import {
  StatusIndicator,
  statusToneFromCompliance,
} from "@/components/ui/status-indicator";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { ComplianceArtifact } from "@/lib/compliance-api";

export function ComplianceStatusBadge({ status }: { status: string }) {
  return (
    <StatusIndicator
      label={status.replace(/_/g, " ")}
      tone={statusToneFromCompliance(status)}
    />
  );
}

export function ComplianceArtifactCard({
  artifact,
  actions,
}: {
  artifact: ComplianceArtifact;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base capitalize">{artifact.type}</CardTitle>
          {artifact.label ? (
            <p className="text-sm text-zinc-500">{artifact.label}</p>
          ) : null}
        </div>
        <ComplianceStatusBadge status={artifact.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="truncate font-mono text-xs text-zinc-500">{artifact.fileUrl}</p>
        <p className="text-zinc-600">
          Expiry:{" "}
          {artifact.expiryDate
            ? new Date(artifact.expiryDate).toLocaleDateString()
            : "—"}
        </p>
        {actions}
      </CardContent>
    </Card>
  );
}

export function ComplianceList({
  artifacts,
  emptyLabel = "No artifacts yet.",
}: {
  artifacts: ComplianceArtifact[];
  emptyLabel?: string;
}) {
  if (!artifacts.length) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {artifacts.map((a) => (
        <li key={a.id}>
          <ComplianceArtifactCard artifact={a} />
        </li>
      ))}
    </ul>
  );
}

export function ComplianceReviewPanel({
  items,
  busyId,
  onReview,
}: {
  items: (ComplianceArtifact & {
    organization?: { id: string; name: string };
  })[];
  busyId?: string | null;
  onReview: (id: string, decision: "approve" | "reject") => void;
}) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500">No pending reviews.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <ComplianceArtifactCard
            artifact={item}
            actions={
              <div className="flex flex-wrap items-center gap-2 pt-2">
                  {item.organization ? (
                    <Badge variant="outline">{item.organization.name}</Badge>
                  ) : null}
                <Button
                  size="sm"
                  variant="success"
                  disabled={busyId === item.id}
                  onClick={() => onReview(item.id, "approve")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="critical"
                  disabled={busyId === item.id}
                  onClick={() => onReview(item.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            }
          />
        </li>
      ))}
    </ul>
  );
}
