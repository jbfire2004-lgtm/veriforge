"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileUp, Plus, Settings2 } from "lucide-react";
import {
  WorkspaceHero,
  WorkspaceSection,
} from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrientationDefinitions } from "@/lib/orientation/veriforge-queries";
import {
  parseContentBlocks,
  type OrientationContentMode,
  type OrientationDefinitionType,
} from "@/lib/orientation/veriforge-types";
import {
  ContentModeBadge,
  DefinitionStatusBadge,
  TypeBadge,
} from "./OrientationStatusBadges";

type Props = {
  companyId: number;
  projectId?: number;
  basePath: string;
  requirementsPath?: string;
};

type StatusFilter = "all" | "draft" | "published" | "deprecated";

export function OrientationDashboard({
  companyId,
  projectId,
  basePath,
  requirementsPath,
}: Props) {
  const { data, isLoading, error } = useOrientationDefinitions(companyId, {
    projectId,
  });

  const [typeFilter, setTypeFilter] = useState<"all" | OrientationDefinitionType>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modeFilter, setModeFilter] = useState<"all" | OrientationContentMode>(
    "all",
  );

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (modeFilter !== "all" && item.contentMode !== modeFilter) return false;
      const deprecated = Boolean(
        (item.metadata as { deprecated?: boolean } | undefined)?.deprecated,
      );
      if (statusFilter === "draft" && (item.isPublished || deprecated))
        return false;
      if (statusFilter === "published" && (!item.isPublished || deprecated))
        return false;
      if (statusFilter === "deprecated" && !deprecated) return false;
      return true;
    });
  }, [data, typeFilter, statusFilter, modeFilter]);

  const published = data?.filter((d) => d.isPublished).length ?? 0;

  return (
    <div className="space-y-8">
      <WorkspaceHero
        eyebrow={projectId ? "Project orientations" : "Company orientations"}
        title="Orientations"
        description="Create, publish, and track orientation modules for workers."
        badges={[{ label: "VeriForge", tone: "teal" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={`${basePath}/new?mode=native`}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                Create Orientation
              </Button>
            </Link>
            <Link href={`${basePath}/new?mode=uploaded`}>
              <Button size="sm" variant="outline" className="gap-2 bg-white/10 text-white border-white/30">
                <FileUp className="h-4 w-4" aria-hidden />
                Upload Orientation
              </Button>
            </Link>
            {requirementsPath ? (
              <Link href={requirementsPath}>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-white/10 text-white border-white/30"
                >
                  <Settings2 className="h-4 w-4" aria-hidden />
                  Requirements
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <WorkspaceSection
        title="Definitions"
        description={`${published} published · ${data?.length ?? 0} total`}
      >
        <div
          className="mb-5 flex flex-wrap gap-3"
          role="group"
          aria-label="Filter orientations"
        >
          <FilterSelect
            id="filter-type"
            label="Type"
            value={typeFilter}
            onChange={(v) =>
              setTypeFilter(v as "all" | OrientationDefinitionType)
            }
            options={[
              ["all", "All types"],
              ["company", "Company"],
              ["site", "Site"],
              ["project", "Project"],
              ["safety", "Safety"],
              ["trade", "Trade"],
            ]}
          />
          <FilterSelect
            id="filter-status"
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={[
              ["all", "All statuses"],
              ["draft", "Draft"],
              ["published", "Published"],
              ["deprecated", "Deprecated"],
            ]}
          />
          <FilterSelect
            id="filter-mode"
            label="Content mode"
            value={modeFilter}
            onChange={(v) =>
              setModeFilter(v as "all" | OrientationContentMode)
            }
            options={[
              ["all", "All modes"],
              ["native", "Native"],
              ["uploaded", "Uploaded"],
              ["hybrid", "Hybrid"],
            ]}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-[#B33A3A]" role="alert">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        ) : !filtered.length ? (
          <p className="text-sm text-[#2A2E33]/70">
            {data?.length
              ? "No orientations match these filters."
              : "No orientations yet. Create a native orientation or upload content."}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const blocks = parseContentBlocks(item.contentBlocks);
              const deprecated = Boolean(
                (item.metadata as { deprecated?: boolean } | undefined)
                  ?.deprecated,
              );
              const completionRate = (
                item.metadata as { completionRate?: number } | undefined
              )?.completionRate;

              return (
                <li key={item.id}>
                  <Link
                    href={`${basePath}/${item.id}`}
                    className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F8F8C]"
                  >
                    <Card className="h-full transition-colors hover:border-[#2F8F8C]/45">
                      <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex flex-wrap gap-2">
                          <DefinitionStatusBadge
                            isPublished={item.isPublished}
                            deprecated={deprecated}
                          />
                          <TypeBadge type={item.type} />
                          <ContentModeBadge mode={item.contentMode} />
                        </div>
                        <h3 className="text-base font-semibold leading-snug text-[#1F2328]">
                          {item.title}
                        </h3>
                        <div className="mt-auto space-y-1 text-xs text-[#2A2E33]/65">
                          <p>Version {item.version}</p>
                          <p>
                            {blocks.length} content block
                            {blocks.length === 1 ? "" : "s"}
                          </p>
                          {completionRate != null ? (
                            <p className="font-medium text-[#1A5553]">
                              {Math.round(completionRate)}% completion
                            </p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </WorkspaceSection>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-[#2A2E33]/70">
        {label}
      </Label>
      <select
        id={id}
        className="h-9 min-w-[9rem] rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
