import { sfCn } from "../theme/cn";

/** Maps legacy tones → platform `.vera-status` contract (industrial, no pills). */
const TONES = {
  default: "vera-status vera-status--neutral",
  success: "vera-status vera-status--success",
  warning: "vera-status vera-status--warning",
  danger: "vera-status vera-status--danger",
  info: "vera-status vera-status--info",
} as const;

/**
 * Status badge for Safety Forms / SMS surfaces.
 * Uses platform badge tokens (3px radius) — never rounded-full pills.
 */
export function SfBadge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span className={sfCn(TONES[tone], className)}>{children}</span>
  );
}
