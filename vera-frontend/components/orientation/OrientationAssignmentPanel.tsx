"use client";

import { useState } from "react";
import { assignOrientation } from "@/lib/orientation/api";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  packageId: string;
  scope: "COMPANY" | "PROJECT";
  isPublished: boolean;
  onAssigned?: () => void;
};

export function OrientationAssignmentPanel({
  packageId,
  scope,
  isPublished,
  onAssigned,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAssign() {
    setBusy(true);
    setMessage(null);
    try {
      await assignOrientation(packageId, scope);
      await assignOrientation(packageId, "ONBOARDING");
      setMessage("Workers linked for roster and onboarding.");
      onAssigned?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Assignment"
      description={
        scope === "PROJECT"
          ? "All active project workers are auto-linked when published. Re-run to refresh roster."
          : "All active company workers are auto-linked when published."
      }
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#2A2E33]/10 bg-white p-4">
        <Button
          type="button"
          size="sm"
          disabled={!isPublished || busy}
          onClick={() => void handleAssign()}
        >
          {busy ? "Linking…" : "Re-link workers"}
        </Button>
        {!isPublished ? (
          <p className="text-sm text-[#64748b]">Publish the package before linking workers.</p>
        ) : null}
        {message ? <p className="text-sm text-[#2F8F8C]">{message}</p> : null}
      </div>
    </WorkspaceSection>
  );
}
