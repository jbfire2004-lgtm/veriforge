"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { visiSegmentTrackClass, visiTabClass } from "./visi-ui";

const tabs = [
  {
    href: "/hub/industry-safety",
    label: "Project-Scale",
    match: (p: string) =>
      p === "/hub/industry-safety" || p === "/hub/industry-safety/",
  },
  {
    href: "/hub/industry-safety/company",
    label: "Company-Scale",
    match: (p: string) => p.startsWith("/hub/industry-safety/company"),
  },
] as const;

export function IndustrySafetyPlaneTabs() {
  const pathname = usePathname() || "";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-[#2A2E33]/08 pb-4">
      <div className={visiSegmentTrackClass}>
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={visiTabClass(active)}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <p className="ml-auto text-[11px] font-medium tracking-wide text-[#94a3b8]">
        Isolated data planes · cross-compare requires opt-in
      </p>
    </div>
  );
}
