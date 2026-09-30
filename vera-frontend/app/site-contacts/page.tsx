"use client";

import { SiteContactForm } from "@/src/components/site-contacts/SiteContactForm";
import { SiteContactsTable } from "@/src/components/site-contacts/SiteContactsTable";
import { useSiteContacts } from "@/src/hooks/useSiteContacts";

export default function SiteContactsPage() {
  const contacts = useSiteContacts({ pageSize: 15 });

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Site contacts
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Manage people and escalation roles per site. API:{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            /api/v1/site-contacts
          </code>
          . Filter the table by site using the selector below.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <label className="text-sm text-slate-600" htmlFor="filter-site">
            Filter by site id (optional)
          </label>
          <input
            id="filter-site"
            type="number"
            min={1}
            className="h-9 w-28 rounded-md border border-slate-300 px-2 text-sm"
            placeholder="All sites"
            value={contacts.siteId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              contacts.setSiteId(v === "" ? undefined : parseInt(v, 10));
            }}
          />
        </div>
      </header>

      <SiteContactForm
        disabled={contacts.mutating}
        defaultSiteId={contacts.siteId}
        onSubmit={async (values) => {
          await contacts.create({
            siteId: values.siteId,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            role: values.role,
            isPrimary: values.isPrimary,
          });
        }}
      />

      <SiteContactsTable
        rows={contacts.data}
        loading={contacts.loading}
        error={contacts.error}
        page={contacts.page}
        totalPages={contacts.totalPages}
        search={contacts.search}
        onSearchChange={contacts.setSearch}
        onPageChange={contacts.setPage}
        mutating={contacts.mutating}
        onTogglePrimary={async (row) => {
          await contacts.update(row.id, { isPrimary: !row.isPrimary });
        }}
        onDelete={async (row) => {
          if (
            typeof window !== "undefined" &&
            !window.confirm(`Remove contact ${row.fullName} (id ${row.id})?`)
          ) {
            return;
          }
          await contacts.remove(row.id);
        }}
      />
    </main>
  );
}
