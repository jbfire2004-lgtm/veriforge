import type { SmsBadgeTone } from "@/src/components/sms/design-system/primitives/SmsBadge";

/** Map workflow record status strings to badge tones. */
export function smsWorkflowStatusTone(status: string): SmsBadgeTone {
  const normalized = status.toLowerCase().replace(/[\s-]+/g, "_");

  if (
    ["approved", "complete", "completed", "closed", "locked", "passed"].includes(normalized)
  ) {
    return "success";
  }
  if (
    ["draft", "not_started", "pending"].includes(normalized)
  ) {
    return "secondary";
  }
  if (
    ["in_progress", "under_review", "submitted", "review_required"].includes(normalized)
  ) {
    return "info";
  }
  if (["rejected", "failed", "overdue"].includes(normalized)) {
    return "danger";
  }
  if (["request_changes", "changes_requested", "warning"].includes(normalized)) {
    return "warning";
  }
  return "default";
}

export function formatSmsWorkflowStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSmsWorkflowDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
