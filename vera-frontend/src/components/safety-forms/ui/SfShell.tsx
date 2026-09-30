"use client";

import type { ReactNode } from "react";
import { sfCn } from "../theme/cn";
import "@/src/components/safety-forms/theme/safety-forms-theme.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export function SfShell({ children, className }: Props) {
  return (
    <div className={sfCn("sf-theme sf-page-bg", className)}>{children}</div>
  );
}
