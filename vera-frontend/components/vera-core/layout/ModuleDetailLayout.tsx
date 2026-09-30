import * as React from "react";
import { ModuleDetailTabs } from "@/components/layout/ModuleDetailTabs";
import { ProfileHeader } from "./ProfileHeader";
import type { ModuleId } from "@/lib/wireframes/types";
import { getModuleWireframe } from "@/lib/wireframes/module-registry";
import { tabsForEntity } from "@/lib/navigation/module-tabs";
import type { ModuleTabId } from "@/lib/navigation/types";

const entityMap: Record<
  ModuleId,
  "worker" | "equipment" | "company" | "project" | "provider"
> = {
  workers: "worker",
  equipment: "equipment",
  training: "worker",
  trainingProviders: "provider",
  unionHalls: "company",
  projects: "project",
};

export type ModuleDetailLayoutProps = {
  moduleId: ModuleId;
  basePath: string;
  title: string;
  subtitle?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  includeAdminTabs?: boolean;
  /** Override tab set */
  tabs?: ModuleTabId[];
};

export function ModuleDetailLayout({
  moduleId,
  basePath,
  title,
  subtitle,
  status,
  actions,
  children,
  includeAdminTabs,
  tabs: tabOverride,
}: ModuleDetailLayoutProps) {
  const wf = getModuleWireframe(moduleId);
  const entity = entityMap[moduleId];
  const tabDefs = tabOverride
    ? tabsForEntity(entity).filter((t) => tabOverride.includes(t.id as ModuleTabId))
    : tabsForEntity(entity, { includeAdminTabs });

  return (
    <div className="space-y-6">
      <ProfileHeader
        title={title}
        subtitle={subtitle ?? wf.description}
        status={status}
        actions={actions}
      />
      <ModuleDetailTabs
        basePath={basePath}
        entity={entity}
        includeAdminTabs={includeAdminTabs}
        tabs={tabDefs}
      />
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}


