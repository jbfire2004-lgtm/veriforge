import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
};

/** Standard PM content card — matte industrial panel with optional ISO header. */
export function PmSurfaceCard({
  children,
  className,
  title,
  description,
  icon,
}: Props) {
  return (
    <section
      className={sfCn(
        "rounded-[6px] border border-[var(--sf-border)] bg-[var(--sf-surface)] p-[var(--sms-space-5)] shadow-none",
        className,
      )}
    >
      {title || icon ? (
        <header className="mb-[var(--sms-space-4)] flex items-start gap-3 border-b border-[var(--sf-border)] pb-[var(--sms-space-3)]">
          {icon ? (
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[3px] border border-[var(--sf-border)] bg-[var(--sf-surface-hover)] text-[var(--sf-accent,#1e6fb8)]"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            {title ? <h2 className="sms-text-h2">{title}</h2> : null}
            {description ? (
              <p className="sms-text-body-muted">{description}</p>
            ) : null}
          </div>
        </header>
      ) : null}
      {children}
    </section>
  );
}
