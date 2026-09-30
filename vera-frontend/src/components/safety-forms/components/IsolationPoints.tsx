"use client";

import { PermitChecklist } from "./PermitChecklist";

const ISOLATION_ITEMS = [
  "Electrical isolated",
  "Hydraulic isolated",
  "Pneumatic isolated",
  "Mechanical isolated",
  "Stored energy released",
  "Locks/tags applied",
];

type Props = {
  label: string;
  value?: string[];
  onChange: (checked: string[]) => void;
  disabled?: boolean;
  required?: boolean;
};

export function IsolationPoints(props: Props) {
  return <PermitChecklist {...props} items={ISOLATION_ITEMS} />;
}
