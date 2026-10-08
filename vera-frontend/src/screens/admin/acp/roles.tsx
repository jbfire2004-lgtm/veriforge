"use client";

import { useCallback, useEffect, useState } from "react";
import { createAcpRole, deleteAcpRole, fetchAcpRoles, updateAcpRole, type AcpRole } from "@/lib/acp-api";
import { AcpModal } from "@/src/components/acp/AcpModal";
import { AcpPage } from "@/src/components/acp/AcpPage";

export default function AcpRolesPage() {
  const [rows, setRows] = useState<AcpRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editRole, setEditRole] = useState<AcpRole | null>(null);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAcpRoles());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AcpPage
      title="Roles"
      description="RBAC roles — platform-wide or per-tenant."
      actions={
        <button
          type="button"
          onClick={() => setModal(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          New role
        </button>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <p className="font-medium">{r.name}</p>
              <p className="font-mono text-xs text-slate-500">{r.key}</p>
              <p className="mt-2 text-xs text-slate-400">
                {r.permissions?.length ?? 0} permissions
                {r.isSystem ? " · system" : ""}
              </p>
              {!r.isSystem ? (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="text-xs text-teal-600 hover:underline"
                    onClick={() => {
                      setEditRole(r);
                      setName(r.name);
                      setDescription(r.description ?? "");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => {
                      if (confirm(`Delete role ${r.name}?`)) {
                        void deleteAcpRole(r.id).then(load);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <AcpModal
        open={modal}
        title="Create role"
        onClose={() => setModal(false)}
        footer={
          <button
            type="button"
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            onClick={() =>
              void createAcpRole({ key, name }).then(() => {
                setModal(false);
                void load();
              })
            }
          >
            Create
          </button>
        }
      >
        <div className="space-y-3">
          <input
            placeholder="Key (e.g. tenant_admin)"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <input
            placeholder="Display name"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </AcpModal>

      <AcpModal
        open={!!editRole}
        title={`Edit role — ${editRole?.key ?? ""}`}
        onClose={() => setEditRole(null)}
        footer={
          <button
            type="button"
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            onClick={() => {
              if (!editRole) return;
              void updateAcpRole(editRole.id, { name, description: description || undefined })
                .then(load)
                .then(() => setEditRole(null));
            }}
          >
            Save
          </button>
        }
      >
        <div className="space-y-3">
          <input
            placeholder="Display name"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </AcpModal>
    </AcpPage>
  );
}
