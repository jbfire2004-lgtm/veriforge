"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { ListViewLayout } from "../layout/ListViewLayout";
import { VeraDataTable } from "../data/VeraDataTable";
import { FloatingActionButton } from "../layout/FloatingActionButton";
import { getModuleWireframe } from "@/lib/wireframes/module-registry";
import type { ModuleId } from "@/lib/wireframes/types";

export type ModuleListScaffoldProps<TRow> = {
  moduleId: ModuleId;
  data: TRow[];
  getRowId: (row: TRow) => string | number;
  renderCell: (row: TRow, columnId: string) => React.ReactNode;
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  createHref?: string;
  emptyMessage?: string;
  /** Omit duplicate header when nested in AdminPageShell. */
  embedded?: boolean;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  searchSlot?: React.ReactNode;
  /** Replace default VeraDataTable (e.g. bulk roster table). */
  children?: React.ReactNode;
};

export function ModuleListScaffold<TRow>({
  moduleId,
  data,
  getRowId,
  renderCell,
  loading,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  createHref,
  emptyMessage,
  embedded,
  toolbar,
  footer,
  searchSlot,
  children: tableOverride,
}: ModuleListScaffoldProps<TRow>) {
  const wf = getModuleWireframe(moduleId);
  const href = createHref ?? `${wf.listPath}/new`;
  const Icon = wf.icon;

  return (
    <>
      <ListViewLayout
        title={wf.title}
        description={wf.description}
        embedded={embedded}
        filters={wf.filters}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchSlot={searchSlot}
        searchPlaceholder={`Search ${wf.title.toLowerCase()}…`}
        actions={
          wf.createLabel ? (
            <Link href={href} className={buttonStyles({ variant: "primary" })}>
              <Plus className="h-4 w-4" aria-hidden />
              {wf.createLabel}
            </Link>
          ) : null
        }
        footer={footer}
      >
        {toolbar}
        {tableOverride ?? (
          <VeraDataTable
            columns={wf.columns}
            data={data}
            getRowId={getRowId}
            getRowHref={(row) => wf.detailPath(getRowId(row))}
            renderCell={renderCell}
            loading={loading}
            emptyMessage={emptyMessage ?? `No ${wf.title.toLowerCase()} found.`}
          />
        )}
      </ListViewLayout>
      {wf.createLabel ? (
        <FloatingActionButton href={href} label={wf.createLabel} icon={Icon} />
      ) : null}
    </>
  );
}
