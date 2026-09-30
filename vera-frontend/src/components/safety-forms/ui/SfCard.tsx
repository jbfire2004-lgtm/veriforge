"use client";

import type { ReactNode } from "react";
import { sfCn } from "../theme/cn";

type Props = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const PAD = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export function SfCard({
  children,
  className,
  interactive,
  padding = "md",
}: Props) {
  return (
    <article
      className={sfCn(
        "sf-card sf-animate-in",
        interactive && "sf-card-interactive cursor-pointer",
        PAD[padding],
        className,
      )}
    >
      {children}
    </article>
  );
}
