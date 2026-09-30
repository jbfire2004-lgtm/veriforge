"use client";

import { useState } from "react";
import type { SiteDto } from "@/src/api/sites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SitesDataTable } from "@/src/components/sites/SitesDataTable";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreSitesDataTablePage() {
  const [lastClick, setLastClick] = useState<SiteDto | null>(null);

  return (
    <VeraPageLayout
      title="Sites directory"
      description={
        <>
          Server-driven table via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">GET /api/v1/sites</code> with
          pagination, search, sort, and{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">activeOnly</code>.
        </>
      }
    >
      {lastClick ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          Last row click:{" "}
          <span className="font-medium">
            {lastClick.name} (id {lastClick.id})
          </span>
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Site directory</CardTitle>
          <CardDescription>
            TanStack Table with row click handlers for site master data and access context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SitesDataTable onRowClick={setLastClick} />
        </CardContent>
      </Card>
    </VeraPageLayout>
  );
}
