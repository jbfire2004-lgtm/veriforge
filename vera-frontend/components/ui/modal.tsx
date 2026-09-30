"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showClose?: boolean;
  /** Called once whenever the modal transitions from open to closed. */
  onClose?: () => void;
  /** When true (default) clicking the backdrop dismisses the dialog. */
  dismissOnBackdrop?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  showClose = true,
  onClose,
  dismissOnBackdrop = true,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onDialogClose = () => {
      onOpenChange(false);
      onCloseRef.current?.();
    };
    d.addEventListener("close", onDialogClose);
    return () => d.removeEventListener("close", onDialogClose);
  }, [onOpenChange]);

  React.useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDialogElement>) {
    if (!dismissOnBackdrop) return;
    if (e.target === dialogRef.current) {
      dialogRef.current?.close();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onMouseDown={handleBackdropMouseDown}
      className={cn(
        "vera-modal fixed left-1/2 top-1/2 z-50 flex max-h-[min(92dvh,720px)] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-vera-charcoal/10 bg-vera-white p-0 text-vera-charcoal shadow-md sm:w-[calc(100%-2rem)]",
        className
      )}
    >
      {(title != null || description != null || showClose) && (
        <div className="flex items-start justify-between gap-vera-3 border-b border-vera-charcoal/10 px-vera-4 py-vera-4 sm:gap-vera-4 sm:px-vera-6 sm:py-vera-5">
          <div className="min-w-0 space-y-vera-2">
            {title != null && (
              <h2 className="text-base font-medium leading-tight tracking-tight text-vera-charcoal sm:text-lg">
                {title}
              </h2>
            )}
            {description != null && (
              <p className="text-sm leading-relaxed text-vera-muted">{description}</p>
            )}
          </div>
          {showClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-vera-muted hover:text-vera-charcoal"
              aria-label="Close"
              onClick={() => {
                dialogRef.current?.close();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
      <div className="max-h-[min(70dvh,640px)] overflow-y-auto px-vera-4 py-vera-4 text-sm leading-relaxed sm:px-vera-6 sm:py-vera-5">
        {open ? children : null}
      </div>
      {footer != null && (
        <div className="flex flex-col-reverse gap-vera-2 border-t border-vera-charcoal/10 px-vera-4 py-vera-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-vera-3 sm:px-vera-6 sm:py-vera-5 [&>*]:w-full sm:[&>*]:w-auto">
          {footer}
        </div>
      )}
    </dialog>
  );
}
