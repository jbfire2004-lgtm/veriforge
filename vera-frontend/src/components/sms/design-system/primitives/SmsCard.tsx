import type { ReactNode } from "react";
import { SfCard } from "@/src/components/safety-forms/ui/SfCard";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Standard card vs hover-lift interactive */
  variant?: "standard" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  title?: ReactNode;
  description?: ReactNode;
};

/** SMS card — standard surface for dashboards, forms, and detail panels. */
export function SmsCard({
  children,
  className,
  variant = "standard",
  padding = "md",
  title,
  description,
}: Props) {
  return (
    <SfCard
      interactive={variant === "interactive"}
      padding={padding}
      className={className}
    >
      {title || description ? (
        <header className="mb-[var(--sms-space-4)] space-y-1">
          {title ? <h2 className="sms-text-h2">{title}</h2> : null}
          {description ? (
            <p className="sms-text-body-muted">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </SfCard>
  );
}
