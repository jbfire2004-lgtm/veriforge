"use client";

import { useState } from "react";
import type { SiteContactDto } from "@/src/types/site-contact";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";

export interface SiteContactsTableProps {
  rows: SiteContactDto[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  mutating: boolean;
  onTogglePrimary: (row: SiteContactDto) => Promise<void>;
  onDelete: (row: SiteContactDto) => Promise<void>;
}

export function SiteContactsTable({
  rows,
  loading,
  error,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  mutating,
  onTogglePrimary,
  onDelete,
}: SiteContactsTableProps) {
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Site contacts</CardTitle>
          <CardDescription>
            REST: <code className="text-xs">GET /api/v1/site-contacts</code>
          </CardDescription>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name, email, phone, role…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading || mutating}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}
        {actionError && (
          <div
            className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="alert"
          >
            {actionError}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Site</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Primary</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                    No contacts found.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.siteId}</td>
                  <td className="px-3 py-2 font-medium">{r.fullName}</td>
                  <td className="px-3 py-2 text-slate-600">{r.email ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.phone ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.role ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.isPrimary
                          ? "bg-violet-100 text-violet-800"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {r.isPrimary ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={mutating}
                      onClick={async () => {
                        setActionError(null);
                        try {
                          await onTogglePrimary(r);
                        } catch (e) {
                          setActionError(
                            e instanceof Error ? e.message : String(e)
                          );
                        }
                      }}
                    >
                      {r.isPrimary ? "Unset primary" : "Set primary"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={mutating}
                      onClick={async () => {
                        setActionError(null);
                        try {
                          await onDelete(r);
                        } catch (e) {
                          setActionError(
                            e instanceof Error ? e.message : String(e)
                          );
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || mutating || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || mutating || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
