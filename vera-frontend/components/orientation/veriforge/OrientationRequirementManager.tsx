"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateOrientationRequirement,
  useOrientationDefinitions,
  useOrientationRequirements,
} from "@/lib/orientation/veriforge-queries";
import type { OrientationMustCompleteBefore } from "@/lib/orientation/veriforge-types";
import { DefinitionStatusBadge } from "./OrientationStatusBadges";

type Props = {
  companyId: number;
  projectId?: number;
};

export function OrientationRequirementManager({
  companyId,
  projectId: prefilledProjectId,
}: Props) {
  const defs = useOrientationDefinitions(companyId);
  const reqs = useOrientationRequirements(companyId, {
    projectId: prefilledProjectId,
  });
  const createReq = useCreateOrientationRequirement(companyId);
  const [pending, startTransition] = useTransition();

  const [orientationId, setOrientationId] = useState("");
  const [projectId, setProjectId] = useState(
    prefilledProjectId != null ? String(prefilledProjectId) : "",
  );
  const [siteId, setSiteId] = useState("");
  const [tradeId, setTradeId] = useState("");
  const [unionDispatchType, setUnionDispatchType] = useState("");
  const [mustCompleteBefore, setMustCompleteBefore] =
    useState<OrientationMustCompleteBefore>("arrival");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function submit() {
    setError(null);
    setOk(null);
    if (!orientationId) {
      setError("Select an orientation");
      return;
    }
    startTransition(async () => {
      try {
        await createReq.mutateAsync({
          orientationId,
          companyId,
          projectId: projectId ? parseInt(projectId, 10) : undefined,
          siteId: siteId ? parseInt(siteId, 10) : undefined,
          tradeId: tradeId || undefined,
          unionDispatchType: unionDispatchType || undefined,
          mustCompleteBefore,
          isActive,
        });
        setOk("Requirement saved");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Orientation</Label>
            <select
              className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 text-sm"
              value={orientationId}
              onChange={(e) => setOrientationId(e.target.value)}
            >
              <option value="">Select definition…</option>
              {(defs.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} (v{d.version})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Project ID</Label>
            <Input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={prefilledProjectId != null}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label>Site ID</Label>
            <Input
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label>Trade ID</Label>
            <Input
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label>Union dispatch type</Label>
            <Input
              value={unionDispatchType}
              onChange={(e) => setUnionDispatchType(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label>Must complete before</Label>
            <select
              className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 text-sm"
              value={mustCompleteBefore}
              onChange={(e) =>
                setMustCompleteBefore(
                  e.target.value as OrientationMustCompleteBefore,
                )
              }
            >
              <option value="arrival">Arrival</option>
              <option value="dispatch">Dispatch</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={pending || createReq.isPending}>
              Save requirement
            </Button>
            {error ? (
              <span className="text-sm text-[#B33A3A]">{error}</span>
            ) : null}
            {ok ? <span className="text-sm text-[#3D8F58]">{ok}</span> : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2A2E33]/60">
          Existing requirements
        </h2>
        {reqs.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : !reqs.data?.length ? (
          <p className="text-sm text-[#2A2E33]/65">No requirements yet.</p>
        ) : (
          <ul className="space-y-2">
            {reqs.data.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {r.orientation?.title ?? r.orientationId}
                      </p>
                      <p className="text-xs text-[#2A2E33]/65">
                        Before {r.mustCompleteBefore}
                        {r.projectId != null ? ` · project ${r.projectId}` : ""}
                        {r.tradeId ? ` · trade ${r.tradeId}` : ""}
                        {!r.isActive ? " · inactive" : ""}
                      </p>
                    </div>
                    {r.orientation ? (
                      <DefinitionStatusBadge
                        isPublished={r.orientation.isPublished}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
