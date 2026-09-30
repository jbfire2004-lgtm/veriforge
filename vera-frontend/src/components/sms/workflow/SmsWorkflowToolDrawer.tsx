"use client";

import { memo, type ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  PenLine,
  StickyNote,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SmsButton, SmsDrawer } from "@/src/components/sms/design-system";

export type SmsWorkflowToolActionId =
  | "photo"
  | "hazard"
  | "corrective_action"
  | "note"
  | "signature";

export type SmsWorkflowToolAction = {
  id: SmsWorkflowToolActionId;
  label: string;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
};

const ICONS: Record<SmsWorkflowToolActionId, LucideIcon> = {
  photo: Camera,
  hazard: AlertTriangle,
  corrective_action: Wrench,
  note: StickyNote,
  signature: PenLine,
};

const DEFAULT_ACTIONS: Omit<SmsWorkflowToolAction, "onClick">[] = [
  { id: "photo", label: "Add photo", description: "Capture or upload evidence" },
  { id: "hazard", label: "Add finding", description: "Record a hazard or finding" },
  { id: "corrective_action", label: "Add action", description: "Create a follow-up item" },
  { id: "note", label: "Add note", description: "Add a field note" },
  { id: "signature", label: "Add signature", description: "Collect a signature" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: SmsWorkflowToolAction[];
};

export const SmsWorkflowToolDrawer = memo(function SmsWorkflowToolDrawer({
  open,
  onOpenChange,
  actions,
}: Props) {
  const actionMap = new Map(actions.map((a) => [a.id, a]));

  return (
    <SmsDrawer open={open} onOpenChange={onOpenChange} title="Field tools">
      <ul className="space-y-2" role="menu">
        {DEFAULT_ACTIONS.map((def) => {
          const action = actionMap.get(def.id);
          if (!action) return null;
          const Icon = ICONS[def.id];
          return (
            <li key={def.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => {
                  action.onClick();
                  onOpenChange(false);
                }}
                className="sms-tap-target flex w-full items-center gap-3 rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-3 text-left transition-colors hover:bg-[var(--sf-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--sf-radius-md)] bg-[var(--sms-secondary-muted)] text-[var(--sms-secondary)]">
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[var(--sf-text)]">
                    {action.label}
                  </span>
                  {(action.description ?? def.description) ? (
                    <span className="mt-0.5 block text-xs text-[var(--sf-text-muted)]">
                      {action.description ?? def.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SmsDrawer>
  );
});

type ToolToggleProps = {
  onClick: () => void;
};

/** Floating tools button — sits above workflow footer on mobile. */
export function SmsWorkflowToolToggle({ onClick }: ToolToggleProps) {
  return (
    <div
      className="fixed right-4 z-40 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-8"
    >
      <SmsButton
        type="button"
        size="lg"
        className="sms-tap-target min-w-[5rem] shadow-[var(--sf-shadow-lg)]"
        onClick={onClick}
        aria-label="Open field tools"
        aria-haspopup="dialog"
      >
        Tools
      </SmsButton>
    </div>
  );
}
