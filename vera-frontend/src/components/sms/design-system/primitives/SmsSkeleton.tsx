import { sfCn } from "@/src/components/safety-forms/theme/cn";

export function SmsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={sfCn(
        "animate-pulse rounded-[var(--sf-radius-lg)] bg-[var(--sf-surface-hover)]",
        className,
      )}
    />
  );
}
