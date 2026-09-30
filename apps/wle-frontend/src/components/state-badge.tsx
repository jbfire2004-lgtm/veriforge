import { LifecycleState } from "../types";

const classes: Record<LifecycleState, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-200 text-slate-700",
  expired: "bg-red-100 text-red-700",
  missing_docs: "bg-yellow-100 text-yellow-700",
  not_seen: "bg-orange-100 text-orange-700",
};

export function StateBadge({ state }: { state: LifecycleState }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[state]}`}>
      {state}
    </span>
  );
}
