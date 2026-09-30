"use client";

import { PmFilterChips } from "@/src/components/pm/layout";
import type { PermitsTab } from "@/hooks/usePmPermits";

const TABS: { id: PermitsTab; label: string }[] = [
  { id: "active", label: "Active permits" },
  { id: "pending", label: "Pending approvals" },
  { id: "expired", label: "Expired permits" },
  { id: "templates", label: "Permit templates" },
  { id: "history", label: "Permit history" },
];

type Props = {
  active: PermitsTab;
  onChange: (tab: PermitsTab) => void;
};

/** @deprecated Use PmFilterChips in page filters slot */
export function PermitsTabBar({ active, onChange }: Props) {
  return (
    <PmFilterChips
      items={TABS}
      active={active}
      onChange={(id) => onChange(id as PermitsTab)}
      ariaLabel="Permit views"
    />
  );
}
