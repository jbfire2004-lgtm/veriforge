import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleCode } from "../../types/api";
import { MODULE_META } from "../../types/api";

interface ChecklistItem {
  id: string;
  label: string;
  module?: ModuleCode;
  href?: string;
}

function buildItems(enabled: ModuleCode[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "roles",
      label: "Configure roles and permissions",
      href: "/settings",
    },
  ];
  if (enabled.includes("veripm")) {
    items.push({
      id: "pm-project",
      label: "Create first project in VeriPM",
      module: "veripm",
      href: "/modules/veripm",
    });
  }
  if (enabled.includes("vericore")) {
    items.push({
      id: "core-compliance",
      label: "Set up compliance workflows in VeriCore",
      module: "vericore",
      href: "/modules/vericore",
    });
  }
  if (enabled.includes("verihub")) {
    items.push({
      id: "hub-docs",
      label: "Upload initial documents to VeriHub",
      module: "verihub",
      href: "/modules/verihub",
    });
  }
  return items;
}

export function OnboardingChecklist({ enabledModules }: { enabledModules: ModuleCode[] }) {
  const items = buildItems(enabledModules);
  const storageKey = "vf_onboarding_checklist";
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // ignore
    }
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className="vf-panel p-5">
      <h2 className="font-display text-lg font-semibold text-forge-ink">Onboarding checklist</h2>
      <p className="mt-1 text-sm text-forge-steel">Track the first setup steps for your enabled modules.</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forge-sand/80 px-3 py-2.5"
          >
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="accent-forge-moss"
                checked={Boolean(done[item.id])}
                onChange={() => toggle(item.id)}
              />
              <span className={done[item.id] ? "text-forge-steel line-through" : "text-forge-ink"}>
                {item.label}
              </span>
              {item.module && (
                <span className="rounded bg-forge-mist px-2 py-0.5 text-xs font-medium text-forge-forest">
                  {MODULE_META[item.module].label}
                </span>
              )}
            </label>
            {item.href && (
              <Link to={item.href} className="text-sm font-semibold text-forge-moss hover:underline">
                Open
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
