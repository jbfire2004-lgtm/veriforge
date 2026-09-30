"use client";

import type { ReactNode } from "react";
import { VeraPageLayout } from "@/src/components/navigation";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** Admin control panel page wrapper — uses unified PageLayout (no tab nav). */
export function AcpPage({ title, description, actions, children }: Props) {
  return (
    <VeraPageLayout title={title} description={description} actions={actions}>
      {children}
    </VeraPageLayout>
  );
}
