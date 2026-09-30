import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

export type SmsPageLayoutProps = {
  /** Short label above the title (e.g. "Vera SMS") */
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  /** Sticky action bar on mobile; optional tool drawer slot */
  mobileActions?: ReactNode;
  toolDrawer?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** default = 72rem; narrow = 48rem; full = edge-to-edge within shell */
  width?: "default" | "narrow" | "full";
  className?: string;
};

const WIDTH = {
  default: "max-w-[var(--sms-page-max)]",
  narrow: "max-w-[var(--sms-content-narrow)]",
  full: "max-w-none",
} as const;

/**
 * Unified SMS page layout — mobile-first header, content padding, and optional
 * bottom tool drawer. Use on all SMS surfaces for consistent structure.
 */
export function SmsPageLayout({
  eyebrow,
  title,
  description,
  filters,
  actions,
  mobileActions,
  toolDrawer,
  children,
  footer,
  width = "default",
  className,
}: SmsPageLayoutProps) {
  return (
    <div
      className={sfCn(
        "mx-auto w-full px-[var(--sms-space-4)] py-[var(--sms-space-6)] sm:px-[var(--sms-space-6)] sm:py-[var(--sms-space-8)]",
        WIDTH[width],
        className,
      )}
    >
      {(eyebrow || title || description || actions) && (
        <header className="mb-[var(--sms-space-6)] space-y-[var(--sms-space-4)]">
          <div className="flex flex-col gap-[var(--sms-space-4)] sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              {eyebrow ? <p className="sms-eyebrow">{eyebrow}</p> : null}
              {title ? <h1 className="sms-text-h1">{title}</h1> : null}
              {description ? (
                <div className="sms-text-body-muted max-w-2xl">{description}</div>
              ) : null}
            </div>
            {actions ? (
              <div className="hidden shrink-0 flex-wrap items-center gap-2 md:flex">
                {actions}
              </div>
            ) : null}
          </div>
          {filters ? (
            <div className="flex flex-wrap items-center gap-[var(--sms-space-3)]">
              {filters}
            </div>
          ) : null}
          {mobileActions || actions ? (
            <div className="sms-mobile-actions md:hidden">
              {mobileActions ?? actions}
            </div>
          ) : null}
        </header>
      )}

      <main className="space-y-[var(--sms-space-6)]">{children}</main>

      {footer ? (
        <footer className="mt-[var(--sms-space-8)] border-t border-[var(--sf-border)] pt-[var(--sms-space-4)] sms-text-caption">
          {footer}
        </footer>
      ) : null}

      {toolDrawer}
    </div>
  );
}

/** Alias for navigation spec compatibility */
export { SmsPageLayout as PageLayout };
