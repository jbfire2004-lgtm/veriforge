import type { ReactNode } from "react";
import Link from "next/link";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
};

/** Compact list row card — mobile-friendly register items. */
export function SmsListCard({ children, className, href, onClick }: Props) {
  const classes = sfCn(
    "sms-list-card",
    (href || onClick) && "sms-list-card-interactive cursor-pointer",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sfCn(classes, "w-full text-left")}>
        {children}
      </button>
    );
  }

  return <article className={classes}>{children}</article>;
}
