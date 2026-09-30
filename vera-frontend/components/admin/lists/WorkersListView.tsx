"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { mergeListSearchParams } from "@/lib/navigation/list-query-link";
import { buttonStyles } from "@/components/ui/button";
import { ListViewLayout } from "@/components/vera-core/layout/ListViewLayout";
import { UrlListSearchForm } from "@/components/vera-core/list/UrlListSearchForm";
import { FloatingActionButton } from "@/components/vera-core/layout/FloatingActionButton";
import { getModuleWireframe } from "@/lib/wireframes/module-registry";
import {
  WorkersRosterBulkTable,
  type WorkersRosterRow,
} from "@/components/admin/WorkersRosterBulkTable";
import { Users } from "lucide-react";

export type WorkersListViewProps = {
  companies: { id: number; name: string }[];
  rows: WorkersRosterRow[];
  page: number;
  totalPages: number;
  pageHrefs: string[];
  emptyState: "none" | "no-workers" | "no-matches";
  roster?: string;
  sort: string;
};

export function WorkersListView({
  companies,
  rows,
  page,
  totalPages,
  pageHrefs,
  emptyState,
  roster,
  sort,
}: WorkersListViewProps) {
  const pathname = usePathname() ?? "/admin/workers";
  const searchParams = useSearchParams();
  const queryLink = useCallback(
    (extra: Record<string, string | number | undefined>) =>
      `${pathname}${mergeListSearchParams(searchParams, extra)}`,
    [pathname, searchParams],
  );
  const wf = getModuleWireframe("workers");

  return (
    <>
      <ListViewLayout
        title={wf.title}
        description={wf.description}
        embedded
        searchSlot={
          <UrlListSearchForm
            placeholder="Name, company, or ID…"
            preserveParams={["sort", "roster"]}
          />
        }
      >
        <section className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[#6B7280]">Roster:</span>
          <Link
            href={queryLink({ roster: "", page: 1 })}
            className={buttonStyles({
              variant: roster !== "unassigned" ? "primary" : "outline",
              size: "sm",
            })}
          >
            All workers
          </Link>
          <Link
            href={queryLink({ roster: "unassigned", page: 1 })}
            className={buttonStyles({
              variant: roster === "unassigned" ? "primary" : "outline",
              size: "sm",
            })}
          >
            Unassigned only
          </Link>
        </section>

        <section className="flex flex-wrap gap-2 text-sm">
          <span className="self-center text-[#6B7280]">Sort:</span>
          <Link
            href={queryLink({ sort: "name", page: 1 })}
            className={buttonStyles({
              variant: sort === "name" ? "primary" : "outline",
              size: "sm",
            })}
          >
            Name
          </Link>
          <Link
            href={queryLink({ sort: "company", page: 1 })}
            className={buttonStyles({
              variant: sort === "company" ? "primary" : "outline",
              size: "sm",
            })}
          >
            Company
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

        <WorkersRosterBulkTable
          companies={companies}
          rows={rows}
          page={page}
          totalPages={totalPages}
          pageHrefs={pageHrefs}
          emptyState={emptyState}
        />
      </ListViewLayout>
      <FloatingActionButton
        href="/admin/workers/new"
        label="Add worker"
        icon={Users}
      />
    </>
  );
}
