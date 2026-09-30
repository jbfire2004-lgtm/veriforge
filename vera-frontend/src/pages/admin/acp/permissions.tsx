"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPermissionMatrix,
  setRolePermissions,
  type AcpPermission,
  type AcpRole,
} from "@/lib/acp-api";
import { PermissionMatrix } from "@/src/components/acp/PermissionMatrix";
import { AcpPage } from "@/src/components/acp/AcpPage";

export default function AcpPermissionsPage() {
  const [roles, setRoles] = useState<AcpRole[]>([]);
  const [permissions, setPermissions] = useState<AcpPermission[]>([]);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchPermissionMatrix();
    setRoles(data.roles);
    setPermissions(data.permissions);
    const map: Record<string, Set<string>> = {};
    for (const role of data.roles) {
      map[role.id] = new Set(
        role.permissions?.map((rp) => rp.permission.id) ?? [],
      );
    }
    setSelected(map);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(roleId: string, permissionId: string, enabled: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(prev[roleId] ?? []);
      if (enabled) set.add(permissionId);
      else set.delete(permissionId);
      next[roleId] = set;
      return next;
    });
  }

  async function save(roleId: string) {
    setSavingRoleId(roleId);
    try {
      await setRolePermissions(roleId, [...(selected[roleId] ?? [])]);
      await load();
    } finally {
      setSavingRoleId(null);
    }
  }

  return (
    <AcpPage
      title="Permissions"
      description="Permission matrix — grant capabilities to each role."
    >
      <PermissionMatrix
        roles={roles}
        permissions={permissions}
        selected={selected}
        onToggle={toggle}
        onSave={(id) => void save(id)}
        savingRoleId={savingRoleId}
      />
    </AcpPage>
  );
}
