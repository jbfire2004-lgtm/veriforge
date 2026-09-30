"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { vwBtn, vwSurface } from "./tokens";
import { VwLockIcon } from "./icons";

export type VeriWalletPermission = {
  id: string;
  role: string;
  description: string;
  enabled: boolean;
  critical?: boolean;
};

const DEFAULT_PERMISSIONS: VeriWalletPermission[] = [
  {
    id: "spend-credits",
    role: "Spend verification credits",
    description: "Authorize credit consumption for asset attestations.",
    enabled: true,
  },
  {
    id: "transfer-credits",
    role: "Transfer credits",
    description: "Move credits between permissioned wallets.",
    enabled: true,
  },
  {
    id: "bind-identity",
    role: "Bind identity tokens",
    description: "Attach credentials and ISO identity badges.",
    enabled: false,
  },
  {
    id: "admin-revoke",
    role: "Revoke wallet access",
    description: "Critical: permanently revoke subject permissions.",
    enabled: true,
    critical: true,
  },
];

/**
 * Identity & permissions — graphite panels, ISO lock icons, blue enabled toggles.
 * Critical revocations use controlled red text only (no red buttons).
 */
export function VeriWalletPermissions({
  permissions = DEFAULT_PERMISSIONS,
  onToggle,
  onRevoke,
}: {
  permissions?: VeriWalletPermission[];
  onToggle?: (id: string, enabled: boolean) => void;
  onRevoke?: (id: string) => void;
}) {
  const [local, setLocal] = React.useState(permissions);

  React.useEffect(() => {
    setLocal(permissions);
  }, [permissions]);

  function toggle(id: string) {
    setLocal((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    );
    const next = local.find((p) => p.id === id);
    onToggle?.(id, !(next?.enabled ?? false));
  }

  return (
    <section className="space-y-3">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
          Identity & permissions
        </p>
        <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
          Role-based access for this wallet
        </h3>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {local.map((perm) => (
          <article
            key={perm.id}
            className={cn(vwSurface.graphite, "flex flex-col gap-3 p-4")}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[3px] border border-[#5A6169] bg-[#2A2E33] text-[#1E6FB8]">
                <VwLockIcon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F4F6F8]">
                  {perm.role}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#A8B0B8]">
                  {perm.description}
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#5A6169] pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#D5DBE0]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={perm.enabled}
                  onClick={() => toggle(perm.id)}
                  className={cn(
                    "relative h-5 w-9 rounded-[3px] border transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B3F45]",
                    perm.enabled
                      ? "border-[#174F86] bg-[#1E6FB8]"
                      : "border-[#5A6169] bg-[#2A2E33]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-3.5 w-3.5 rounded-[2px] bg-[#F4F6F8] transition-[left] duration-150",
                      perm.enabled ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </button>
                <span>{perm.enabled ? "Enabled" : "Disabled"}</span>
              </label>

              {perm.critical ? (
                <button
                  type="button"
                  onClick={() => onRevoke?.(perm.id)}
                  className={cn(
                    vwBtn.base,
                    vwBtn.secondary,
                    "h-8 px-2.5 text-xs",
                  )}
                >
                  <span className="text-[#B33A3A]">Revoke access</span>
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
