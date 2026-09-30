import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  VeriForgeDivider,
  VeriForgeFrame,
  VeriForgeSectionHeader,
} from "./theme";
import { VeriForgeButton } from "./button";
import { VerificationIcon } from "./icons";

/**
 * Industrial modal — slate frame, matte overlay, safety-blue primary action.
 * Never uses red for confirm CTAs.
 */
export function VeriForgeModal({
  open,
  title,
  description,
  children,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
  primaryVariant = "action",
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryVariant?: "primary" | "action" | "warning" | "success";
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#1C1F24]/75 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vf-modal-title"
        className="w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <VeriForgeFrame className="border-[#5A6169] bg-[#2A2E33] shadow-none">
          <div className="p-5">
            <VeriForgeSectionHeader
              title={title}
              description={description}
              icon={<VerificationIcon size={16} tone="active" />}
            />
            <div id="vf-modal-title" className="sr-only">
              {title}
            </div>
            <div className="text-[#D5DBE0]">{children}</div>
            <VeriForgeDivider className="my-4" />
            <footer className="flex justify-end gap-2">
              <VeriForgeButton variant="ghost" onClick={onClose}>
                Cancel
              </VeriForgeButton>
              {primaryActionLabel ? (
                <VeriForgeButton
                  variant={primaryVariant}
                  onClick={onPrimaryAction}
                >
                  {primaryActionLabel}
                </VeriForgeButton>
              ) : null}
            </footer>
          </div>
        </VeriForgeFrame>
      </div>
    </div>
  );
}
