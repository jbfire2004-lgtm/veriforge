"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { mergeListSearchParams } from "@/lib/navigation/list-query-link";
import { EquipmentComplianceBadge } from "@/components/equipment/EquipmentComplianceBadge";
import { Badge, Pagination } from "@/components/ui";
import { ModuleListScaffold } from "@/components/vera-core/scaffolds/ModuleListScaffold";
import { ActionMenu } from "@/components/vera-core/data/ActionMenu";
import { UrlListSearchForm } from "@/components/vera-core/list/UrlListSearchForm";
import type { EquipmentSummary } from "@/lib/api/equipment-core";

export type EquipmentListViewProps = {
  rows: EquipmentSummary[];
  page: number;
  totalPages: number;
};

export function EquipmentListView({
  rows,
  page,
  totalPages,
}: EquipmentListViewProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin/equipment";
  const searchParams = useSearchParams();
  const getPageHref = useCallback(
    (targetPage: number) =>
      `${pathname}${mergeListSearchParams(searchParams, { page: targetPage })}`,
    [pathname, searchParams],
  );
  const compliant = searchParams?.get("compliant") ?? "";
  const activeFilter =
    compliant === "true" ? "compliant" : compliant === "false" ? "noncompliant" : "";

  function onFilterChange(id: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.delete("page");
    if (id === activeFilter || !id) {
      next.delete("compliant");
    } else if (id === "compliant") {
      next.set("compliant", "true");
    } else if (id === "noncompliant") {
      next.set("compliant", "false");
    } else {
      next.delete("compliant");
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <ModuleListScaffold
      embedded
      moduleId="equipment"
      data={rows}
      getRowId={(r) => r.id}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      searchSlot={
        <UrlListSearchForm
          placeholder="Name, serial, or ID…"
          preserveParams={["compliant", "complianceStatus"]}
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          getHref={getPageHref}
          label="Equipment pagination"
        />
      }
      renderCell={(row, col) => {
        const st = row.safetyStatus as string | undefined;
        const ok = st === "OK";
        const inspect = st === "NEEDS_INSPECTION";
        if (col === "tag") {
          return (
            <span className="font-medium text-[#111827]">
              {row.name}
              {row.serialNumber ? (
                <span className="ml-2 text-sm text-[#6B7280]">{row.serialNumber}</span>
              ) : null}
            </span>
          );
        }
        if (col === "type") {
          return (
            <span className="text-[#6B7280]">
              {(row as EquipmentSummary & { equipmentType?: string }).equipmentType ?? "—"}
            </span>
          );
        }
        if (col === "status") {
          return (
            <Badge variant={ok ? "success" : inspect ? "warning" : "danger"}>
              {st ?? "—"}
            </Badge>
          );
        }
        if (col === "compliance") {
          return (
            <EquipmentComplianceBadge
              status={
                (row as EquipmentSummary & { complianceStatus?: string }).complianceStatus
              }
            />
          );
        }
        if (col === "inspection") {
          const nextAt = (row as EquipmentSummary & { nextInspectionAt?: string })
            .nextInspectionAt;
          return (
            <span className="text-sm text-[#6B7280]">
              {nextAt ? new Date(nextAt).toLocaleDateString() : "—"}
            </span>
          );
        }
        if (col === "actions") {
          return (
            <ActionMenu
              items={[
                {
                  id: "view",
                  label: "View",
                  onSelect: () => {
                    router.push(`/admin/equipment/${row.id}`);
                  },
                },
                {
                  id: "edit",
                  label: "Edit",
                  onSelect: () => {
                    router.push(`/admin/equipment/${row.id}/edit`);
                  },
                },
                {
                  id: "delete",
                  label: "Delete",
                  destructive: true,
                  onSelect: () => {
                    router.push(`/admin/equipment/${row.id}/delete`);
                  },
                },
              ]}
            />
          );
        }
        return null;
      }}
    />
  );
}
