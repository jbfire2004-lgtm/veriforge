"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/src/lib/utils";

export type ListHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  search?: React.ReactNode;
  className?: string;
};

export function ListHeader({
  title,
  description,
  actions,
  filters,
  search,
  className,
}: ListHeaderProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {(search || filters) && (
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {search}
          {filters}
        </section>
      )}
    </section>
  );
}
