import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function LoadingSpinner({
  label = "Loading",
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 text-[var(--muted-foreground)]", className)}
    >
      <Loader2 className={cn("animate-spin text-[var(--color-primary)]", sizes[size])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
