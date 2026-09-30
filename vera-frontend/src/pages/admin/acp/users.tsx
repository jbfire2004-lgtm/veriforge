"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignUserRole,
  assignUserTenant,
  createAcpUser,
  deleteAcpUser,
  fetchAcpRoles,
  fetchAcpUsers,
  fetchTenants,
  removeUserRole,
  setUserActive,
  type AcpRole,
  type AcpTenant,
  type AcpUserRow,
} from "@/lib/acp-api";
import { AcpToggle } from "@/components/vera-access/AcpToggle";
import { AcpModal } from "@/src/components/acp/AcpModal";
import { AcpPage } from "@/src/components/acp/AcpPage";

export default function AcpUsersPage() {
  const [users, setUsers] = useState<AcpUserRow[]>([]);
  const [tenants, setTenants] = useState<AcpTenant[]>([]);
  const [roles, setRoles] = useState<AcpRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleModal, setRoleModal] = useState<AcpUserRow | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "WORKER",
    acpTenantId: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, t, r] = await Promise.all([
        fetchAcpUsers(),
        fetchTenants(),
        fetchAcpRoles(),
      ]);
      setUsers(u);
      setTenants(t);
      setRoles(r);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AcpPage
      title="Users"
      description="Create users, assign tenants, roles, and activate or deactivate accounts."
      actions={
        <button
          type="button"
          onClick={() => setCreateModal(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
        >
          New user
        </button>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Legacy role</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">ACP roles</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.role}</td>
                  <td className="px-4 py-3">
                    <AcpToggle
                      checked={u.active !== false}
                      onChange={(active) =>
                        void setUserActive(u.id, active).then(load)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
                      value={u.acpTenantId ?? ""}
                      onChange={(e) =>
                        void assignUserTenant(u.id, e.target.value || null).then(load)
                      }
                    >
                      <option value="">—</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.acpUserRoles.map((r) => r.role.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-3 text-xs text-teal-600 hover:underline"
                      onClick={() => setRoleModal(u)}
                    >
                      Roles
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => {
                        if (confirm(`Delete user ${u.email}?`)) {
                          void deleteAcpUser(u.id).then(load);
                        }
                      }}
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

      <AcpModal
        open={createModal}
        title="Create user"
        onClose={() => setCreateModal(false)}
        footer={
          <button
            type="button"
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            onClick={() =>
              void createAcpUser({
                ...form,
                acpTenantId: form.acpTenantId || undefined,
              })
                .then(load)
                .then(() => setCreateModal(false))
            }
          >
            Create
          </button>
        }
      >
        <div className="space-y-3">
          {(["email", "username", "password"] as const).map((field) => (
            <label key={field} className="block text-sm">
              <span className="mb-1 block capitalize text-slate-500">{field}</span>
              <input
                type={field === "password" ? "password" : "text"}
                className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Role</span>
            <select
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="WORKER">WORKER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Tenant</span>
            <select
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              value={form.acpTenantId}
              onChange={(e) => setForm((f) => ({ ...f, acpTenantId: e.target.value }))}
            >
              <option value="">—</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AcpModal>

      <AcpModal
        open={!!roleModal}
        title={`Roles — ${roleModal?.email ?? ""}`}
        onClose={() => setRoleModal(null)}
        footer={
          <button
            type="button"
            className="rounded-lg bg-teal-600 px-4 py-1.5 text-sm text-white"
            onClick={() => {
              if (!roleModal || !roleId) return;
              void assignUserRole(roleModal.id, roleId, roleModal.acpTenantId ?? undefined)
                .then(load)
                .then(() => setRoleModal(null));
            }}
          >
            Assign role
          </button>
        }
      >
        {roleModal ? (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">Add role</span>
              <select
                className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">Select…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.key})
                  </option>
                ))}
              </select>
            </label>
            <ul className="space-y-2 text-sm">
              {roleModal.acpUserRoles.map((ur) => (
                <li key={ur.role.id} className="flex justify-between">
                  <span>{ur.role.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      void removeUserRole(
                        roleModal.id,
                        ur.role.id,
                        roleModal.acpTenantId ?? undefined,
                      ).then(load)
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AcpModal>
    </AcpPage>
  );
}
