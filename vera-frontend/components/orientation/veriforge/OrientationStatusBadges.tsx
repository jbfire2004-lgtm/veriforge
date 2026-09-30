"use client";

import { Badge } from "@/components/ui/badge";

export function DefinitionStatusBadge({
  isPublished,
  deprecated,
}: {
  isPublished: boolean;
  deprecated?: boolean;
}) {
  if (deprecated) {
    return <Badge variant="outline">Deprecated</Badge>;
  }
  if (isPublished) {
    return <Badge variant="success">Published</Badge>;
  }
  return <Badge variant="warning">Draft</Badge>;
}

export function CompletionStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (s === "completed") return <Badge variant="success">Completed</Badge>;
  if (s === "expired") return <Badge variant="danger">Expired</Badge>;
  if (s === "failed") return <Badge variant="danger">Failed</Badge>;
  if (s === "in_progress" || s === "in-progress") {
    return <Badge variant="teal">In progress</Badge>;
  }
  return <Badge variant="warning">Pending</Badge>;
}

export function ContentModeBadge({ mode }: { mode: string }) {
  const label =
    mode === "uploaded"
      ? "Uploaded"
      : mode === "hybrid"
        ? "Hybrid"
        : mode === "native"
          ? "Native"
          : mode;
  return <Badge variant="teal">{label}</Badge>;
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="capitalize">
      {type}
    </Badge>
  );
}

export function GatingBanner({
  gatingStatus,
  missingCount,
  missingTitles,
  projectLabel,
}: {
  gatingStatus: "allowed" | "blocked" | "warning";
  missingCount?: number;
  missingTitles: string[];
  projectLabel?: string | null;
}) {
  if (gatingStatus === "allowed" || missingTitles.length === 0) return null;
  const count = missingCount ?? missingTitles.length;
  const project = projectLabel?.trim() || "this project";

  if (gatingStatus === "blocked") {
    return (
      <div
        role="alert"
        className="rounded-[3px] border border-[#8F2E2E]/35 bg-[#B33A3A]/10 px-4 py-3 text-sm leading-relaxed text-[#5C1E1E]"
      >
        You must complete {count} orientation{count === 1 ? "" : "s"} before
        starting work on {project}.
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-[3px] border border-[#A8842F]/40 bg-[#C89F3D]/15 px-4 py-3 text-sm leading-relaxed text-[#3D3210]"
    >
      Recommended before assignment: {missingTitles.slice(0, 3).join(", ")}
      {missingTitles.length > 3 ? ` +${missingTitles.length - 3} more` : ""}.
    </div>
  );
}
