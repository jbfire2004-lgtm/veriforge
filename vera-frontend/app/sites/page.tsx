"use client";

import { SiteForm } from "@/src/components/sites/SiteForm";
import { SitesTable } from "@/src/components/sites/SitesTable";
import { SiteVerificationPanel } from "@/src/components/sites/SiteVerificationPanel";
import { useSites } from "@/src/hooks/useSites";

export default function SitesDirectoryPage() {
  const sites = useSites({ pageSize: 10 });

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Site directory
        </h1>
        <p className="text-slate-600 text-sm">
          VERA REST API under{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">/api/v1/sites</code>.
          Set{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          to your Nest server (default http://localhost:3001).
        </p>
      </header>

      <SiteForm
        disabled={sites.mutating}
        onSubmit={async (values) => {
          await sites.create({
            name: values.name,
            code: values.code,
            region: values.region,
            active: values.active ?? true,
          });
        }}
      />

      <SitesTable
        rows={sites.data}
        loading={sites.loading}
        error={sites.error}
        page={sites.page}
        totalPages={sites.totalPages}
        search={sites.search}
        onSearchChange={sites.setSearch}
        onPageChange={sites.setPage}
        mutating={sites.mutating}
        onToggleActive={async (row) => {
          await sites.update(row.id, { active: !row.active });
        }}
        onDelete={async (row) => {
          if (
            typeof window !== "undefined" &&
            !window.confirm(`Delete site ${row.id} (${row.name})?`)
          ) {
            return;
          }
          await sites.remove(row.id);
        }}
      />

      <SiteVerificationPanel />
    </main>
  );
}
