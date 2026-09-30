"use client";

import { useFieldMode } from "./FieldModeProvider";
import { PendingSyncBadge } from "./PendingSyncBadge";
import { Button } from "@/components/ui/button";

export type OfflineFormFooterProps = {
  onSaveLocal: () => void | Promise<void>;
  saveLabel?: string;
  disabled?: boolean;
};

/** Footer for forms that queue changes when offline (§6). */
export function OfflineFormFooter({
  onSaveLocal,
  saveLabel = "Save offline",
  disabled,
}: OfflineFormFooterProps) {
  const { fieldModeActive } = useFieldMode();

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
      {fieldModeActive ? <PendingSyncBadge /> : <span />}
      <Button
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={() => void onSaveLocal()}
      >
        {fieldModeActive ? saveLabel : "Save"}
      </Button>
    </footer>
  );
}
