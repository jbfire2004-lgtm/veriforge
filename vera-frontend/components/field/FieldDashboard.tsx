"use client";

/**
 * FieldOS dashboard — live field binder hub.
 * Kept as FieldDashboard export for existing `/field` route imports.
 */
import { FieldBinderView } from "./FieldBinderView";

type Props = {
  role: string | null;
  companyId?: number;
  projectId?: number;
};

export function FieldDashboard({ role, companyId, projectId }: Props) {
  return (
    <FieldBinderView
      role={role}
      companyId={companyId}
      projectId={projectId}
    />
  );
}
