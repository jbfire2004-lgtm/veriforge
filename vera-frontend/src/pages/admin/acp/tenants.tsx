"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTenant,
  deleteTenant,
  fetchTenants,
  updateTenant,
  type AcpTenant,
} from "@/lib/acp-api";
import { AcpModal } from "@/src/components/acp/AcpModal";
import { AcpPage } from "@/src/components/acp/AcpPage";
import { TenantModulesPanel } from "@/src/components/acp/TenantModulesPanel";

export default function AcpTenantsPage() {
  const [rows, setRows] = useState<AcpTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [editTenant, setEditTenant] = useState<AcpTenant | null>(null);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchTenants());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    await createTenant({ slug, name });
    setModal(false);
    setSlug("");
    setName("");
    await load();
  }

  return (
    <AcpPage
      title="Tenants"
      description="Organizations on the Vera platform — each tenant has users, roles, subscription, and feature flags."
      actions={
        <button
          type="button"
          onClick={() => setModal(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          New tenant
        </button>
      }
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Users</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3">{t.subscription?.tier?.name ?? "—"}</td>
                  <td className="px-4 py-3">{t._count?.users ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-3 text-xs text-teal-600 hover:underline"
                      onClick={() => {
                        setEditTenant(t);
                        setName(t.name);
                        setSlug(t.slug);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="mr-3 text-xs text-teal-600 hover:underline"
                      onClick={() => setManageId(t.id)}
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => void deleteTenant(t.id).then(load)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {manageId ? (
        <TenantModulesPanel tenantId={manageId} onUpdated={load} />
      ) : null}

      <AcpModal
        open={modal}
        title="Create tenant"
        onClose={() => setModal(false)}
        footer={
          <>
            <button type="button" onClick={() => setModal(false)} className="px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleCreate()}
              className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            >
              Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Slug</span>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Name</span>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
      </AcpModal>

      <AcpModal
        open={!!editTenant}
        title="Edit tenant"
        onClose={() => setEditTenant(null)}
        footer={
          <button
            type="button"
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            onClick={() => {
              if (!editTenant) return;
              void updateTenant(editTenant.id, { name, slug })
                .then(load)
                .then(() => setEditTenant(null));
            }}
          >
            Save
          </button>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Slug</span>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Name</span>
            <input
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
      </AcpModal>
    </AcpPage>
  );
}
