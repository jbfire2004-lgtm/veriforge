import * as React from "react";
import { cn } from "@/src/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function LineIcon({
  size = 20,
  className,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** ISO-style identity badge */
export function VwIdentityIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M7.5 17c1.2-2 2.6-3 4.5-3s3.3 1 4.5 3" />
    </LineIcon>
  );
}

/** Lock — permissions / secure actions */
export function VwLockIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1.2" />
    </LineIcon>
  );
}

/** Credits / balance */
export function VwCreditsIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M9 9.5c.8-1 2-1.5 3-1.5s2.2.5 3 1.5M9 14.5c.8 1 2 1.5 3 1.5s2.2-.5 3-1.5" />
    </LineIcon>
  );
}

/** Ledger */
export function VwLedgerIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5" />
      <path d="M9 12h8M9 15h6M9 18h4" />
    </LineIcon>
  );
}

/** Transfer */
export function VwTransferIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M7 8h11M15 5l3 3-3 3" />
      <path d="M17 16H6M9 13l-3 3 3 3" />
    </LineIcon>
  );
}

/** Verify asset */
export function VwVerifyIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M12 3 5 6v5c0 5.2 3.1 8.6 7 10 3.9-1.4 7-4.8 7-10V6l-7-3Z" />
      <path d="M9 12.2 11.2 14.4 15.5 9.5" />
    </LineIcon>
  );
}

/** Add credits */
export function VwAddIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </LineIcon>
  );
}
