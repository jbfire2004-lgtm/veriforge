import { cn } from "@/src/lib/utils";

export type VeraContentContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Constrain width (default: max-w-7xl workspace). */
  size?: "default" | "narrow" | "full";
};

const sizeClass = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  full: "max-w-none",
} as const;

/**
 * Standard main content region — Layer 3+ wrapper inside the platform shell.
 * Use with {@link VeraPageLayout} for title, filters, and actions.
 */
export function VeraContentContainer({
  children,
  className,
  size = "default",
}: VeraContentContainerProps) {
  return (
    <div
      className={cn(
        "vera-motion-fade-up mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        sizeClass[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Official navigation spec alias */
export { VeraContentContainer as ContentContainer };
