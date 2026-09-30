"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { ModuleLinkGrid } from "@/components/theme/workspace";

type ModuleLink = {
  href: string;
  title: string;
  description: string;
};

type Props = {
  modules: readonly ModuleLink[];
  showAdminProjects?: boolean;
};

export function PmModuleGrid({ modules, showAdminProjects }: Props) {
  return (
    <ModuleLinkGrid
      modules={modules}
      sectionId="pm-modules-heading"
      sectionTitle="Modules"
      sectionDescription="Jump into specialized PM tools — each connects to the CAIL when risk is detected."
      extraCards={
        showAdminProjects ? (
          <Link href="/pm/projects" className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#2F8F8C]/40 hover:shadow-md">
            <div className="flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-[#2A2E33] group-hover:text-[#2F8F8C]">
                  Project roster (admin)
                </p>
                <p className="mt-1.5 text-sm text-[#5a6b7c]">
                  Create projects, assign companies, and view readiness scores.
                </p>
              </div>
            </div>
          </Link>
        ) : undefined
      }
    />
  );
}
