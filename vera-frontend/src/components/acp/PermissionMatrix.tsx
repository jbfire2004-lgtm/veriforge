"use client";

import type { AcpPermission, AcpRole } from "@/lib/acp-api";

type Props = {
  roles: AcpRole[];
  permissions: AcpPermission[];
  selected: Record<string, Set<string>>;
  onToggle: (roleId: string, permissionId: string, enabled: boolean) => void;
  onSave: (roleId: string) => void;
  savingRoleId?: string | null;
};

export function PermissionMatrix({
  roles,
  permissions,
  selected,
  onToggle,
  onSave,
  savingRoleId,
}: Props) {
  const modules = [...new Set(permissions.map((p) => p.module))];

  return (
    <div className="space-y-6">
      {roles.map((role) => (
        <section
          key={role.id}
          className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div>
              <h3 className="font-medium">{role.name}</h3>
              <p className="text-xs text-slate-500">{role.key}</p>
            </div>
            <button
              type="button"
              disabled={savingRoleId === role.id}
              onClick={() => onSave(role.id)}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {savingRoleId === role.id ? "Saving…" : "Save"}
            </button>
          </header>
          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 pr-4 font-medium text-slate-500">Permission</th>
                  {modules.map((m) => (
                    <th key={m} className="pb-2 px-2 text-center text-xs font-medium text-slate-400">
                      {m}
                    </th>
                  ))}
                  <th className="pb-2 pl-2 text-center font-medium text-slate-500">Grant</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-2 pr-4">
                      <span className="font-mono text-xs">{perm.key}</span>
                    </td>
                    {modules.map((m) => (
                      <td key={m} className="px-2 py-2 text-center text-slate-300">
                        {perm.module === m ? "•" : ""}
                      </td>
                    ))}
                    <td className="py-2 pl-2 text-center">
                      <input
                        type="checkbox"
                        checked={selected[role.id]?.has(perm.id) ?? false}
                        onChange={(e) => onToggle(role.id, perm.id, e.target.checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
