import { cn } from "@/src/lib/utils";

export type DividerProps = {
  className?: string;
  label?: string;
};

export function Divider({ className, label }: DividerProps) {
  if (label) {
    return (
      <section
        className={cn("flex items-center gap-3 text-xs text-[var(--muted-foreground)]", className)}
        role="separator"
      >
        <hr className="flex-1 border-[var(--border)]" />
        {label}
        <hr className="flex-1 border-[var(--border)]" />
      </section>
    );
  }
  return <hr className={cn("border-[var(--border)]", className)} role="separator" />;
}
