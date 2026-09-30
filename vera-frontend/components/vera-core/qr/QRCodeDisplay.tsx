"use client";

import { cn } from "@/src/lib/utils";

export type QRCodeDisplayProps = {
  /** Data URL or remote URL for QR image */
  src: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
};

export function QRCodeDisplay({
  src,
  title,
  subtitle,
  size = 200,
  className,
}: QRCodeDisplayProps) {
  return (
    <figure
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={title ? `QR code for ${title}` : "QR code"}
        width={size}
        height={size}
        className="rounded-[var(--radius-sm)]"
      />
      {title ? (
        <figcaption className="text-center">
          <p className="font-semibold text-[var(--foreground)]">{title}</p>
          {subtitle ? (
            <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
