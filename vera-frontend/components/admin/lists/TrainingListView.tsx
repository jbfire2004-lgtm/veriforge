"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { mergeListSearchParams } from "@/lib/navigation/list-query-link";
import { Badge, Pagination } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { ModuleListScaffold } from "@/components/vera-core/scaffolds/ModuleListScaffold";
import { StatusBadge } from "@/components/vera-core/data/StatusBadge";
import { VerifiedByVeraBadge } from "@/src/components/verification/VerifiedByVeraBadge";
import { toBadgeStatus, type VerifiedByVeraStatus } from "@vera/api-contract";
import { ActionMenu } from "@/components/vera-core/data/ActionMenu";
import { UrlListSearchForm } from "@/components/vera-core/list/UrlListSearchForm";

export type TrainingListRow = {
  id: number;
  isValid: boolean;
  expiresAt?: string | null;
  worker?: { firstName: string; lastName: string } | null;
  certification?: { name?: string } | null;
  provider?: { name?: string } | null;
  verifiedByVeraStatus?: VerifiedByVeraStatus;
  jurisdictionCoverage?: string[];
  regulatorySummary?: string | null;
};

export type TrainingListViewProps = {
  rows: TrainingListRow[];
  page: number;
  totalPages: number;
  sort: string;
};

export function TrainingListView({
  rows,
  page,
  totalPages,
  sort,
}: TrainingListViewProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin/training";
  const searchParams = useSearchParams();
  const getPageHref = useCallback(
    (targetPage: number) =>
      `${pathname}${mergeListSearchParams(searchParams, { page: targetPage })}`,
    [pathname, searchParams],
  );
  const queryLink = useCallback(
    (extra: Record<string, string | number | undefined>) =>
      `${pathname}${mergeListSearchParams(searchParams, extra)}`,
    [pathname, searchParams],
  );

  return (
    <ModuleListScaffold
      embedded
      moduleId="training"
      data={rows}
      getRowId={(r) => r.id}
      searchSlot={<UrlListSearchForm placeholder="Worker, course, or ID…" preserveParams={["sort"]} />}
      toolbar={
        <section className="flex flex-wrap gap-2 text-sm">
          <span className="self-center text-[#6B7280]">Sort:</span>
          <Link
            href={queryLink({ sort: "expires", page: 1 })}
            className={buttonStyles({
              variant: sort === "expires" ? "primary" : "outline",
              size: "sm",
            })}
          >
            Expires
          </Link>
          <Link
            href={queryLink({ sort: "worker", page: 1 })}
            className={buttonStyles({
              variant: sort === "worker" ? "primary" : "outline",
              size: "sm",
            })}
          >
            Worker
          </Link>
          <Link
            href={queryLink({ sort: "id", page: 1 })}
            className={buttonStyles({
              variant: sort === "id" ? "primary" : "outline",
              size: "sm",
            })}
          >
            ID
          </Link>
        </section>
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          getHref={getPageHref}
          label="Training records pagination"
        />
      }
      renderCell={(row, col) => {
        if (col === "worker") {
          return row.worker
            ? `${row.worker.firstName} ${row.worker.lastName}`
            : "—";
        }
        if (col === "course") {
          return row.certification?.name ?? "—";
        }
        if (col === "provider") {
          return row.provider?.name ?? "—";
        }
        if (col === "status") {
          return (
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={row.isValid ? "verified" : "rejected"}
                label={row.isValid ? "Valid" : "Expired"}
              />
              {row.verifiedByVeraStatus ? (
                <VerifiedByVeraBadge
                  status={toBadgeStatus(row.verifiedByVeraStatus)}
                  jurisdictionCoverage={row.jurisdictionCoverage}
                  regulatorySummary={row.regulatorySummary}
                />
              ) : (
                <VerifiedByVeraBadge trainingRecordId={row.id} />
              )}
            </div>
          );
        }
        if (col === "expiry") {
          return row.expiresAt
            ? new Date(row.expiresAt).toLocaleDateString()
            : "—";
        }
        if (col === "actions") {
          return (
            <ActionMenu
              items={[
                {
                  id: "view",
                  label: "View",
                  onSelect: () => router.push(`/admin/training/${row.id}`),
                },
                {
                  id: "edit",
                  label: "Edit",
                  onSelect: () => router.push(`/admin/training/${row.id}/edit`),
                },
                {
                  id: "delete",
                  label: "Delete",
                  destructive: true,
                  onSelect: () => router.push(`/admin/training/${row.id}/delete`),
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
