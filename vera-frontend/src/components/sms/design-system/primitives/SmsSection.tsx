import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Section block with optional header — groups related SMS content. */
export function SmsSection({ title, description, actions, children, className }: Props) {
  return (
    <section className={sfCn("space-y-[var(--sms-space-4)]", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? <h2 className="sms-text-h2">{title}</h2> : null}
            {description ? (
              <p className="sms-text-body-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}
