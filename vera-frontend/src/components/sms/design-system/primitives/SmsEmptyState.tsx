import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

/** Friendly empty state for SMS lists and workflow steps. */
export function SmsEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: Props) {
  return (
    <div
      role="status"
      className={sfCn(
        "flex flex-col items-center justify-center rounded-[var(--sf-radius-lg)] border border-dashed border-[var(--sf-border)]",
        "bg-[var(--sf-surface-hover)]/40 px-[var(--sms-space-6)] py-[var(--sms-space-8)] text-center",
        className,
      )}
    >
      <span
        className="mb-[var(--sms-space-3)] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sms-secondary-muted)] text-[var(--sms-secondary)]"
        aria-hidden
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="sms-text-h3">{title}</p>
      {description ? (
        <p className="sms-text-body-muted mt-1 max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-[var(--sms-space-4)]">{action}</div> : null}
    </div>
  );
}
