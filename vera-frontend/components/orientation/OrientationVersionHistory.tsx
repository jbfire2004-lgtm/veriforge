"use client";

import { useEffect, useState } from "react";
import {
  listOrientationVersions,
  rollbackOrientationVersion,
} from "@/lib/orientation/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  packageId: string;
  currentVersion: number;
  onRollback?: () => void;
};

export function OrientationVersionHistory({
  packageId,
  currentVersion,
  onRollback,
}: Props) {
  const [versions, setVersions] = useState<
    Array<{ id: string; versionNumber: number; createdAt: string }> | null
  >(null);
  const [rolling, setRolling] = useState<number | null>(null);

  function reload() {
    void listOrientationVersions(packageId).then(setVersions);
  }

  useEffect(() => {
    reload();
  }, [packageId]);

  if (!versions) return <Skeleton className="h-24 w-full rounded-xl" />;

  if (!versions.length) {
    return <p className="text-sm text-[#64748b]">No version history yet.</p>;
  }

  return (
    <ul className="divide-y divide-[#2A2E33]/10 rounded-2xl border border-[#2A2E33]/10 bg-white">
      {versions.map((v) => (
        <li
          key={v.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
        >
          <div>
            <span className="font-semibold text-[#2A2E33]">Version {v.versionNumber}</span>
            {v.versionNumber === currentVersion ? (
              <span className="ml-2 rounded-full bg-[#E4F3F2] px-2 py-0.5 text-xs font-medium text-[#247A78]">
                Current
              </span>
            ) : null}
            <p className="text-xs text-[#64748b]">
              {new Date(v.createdAt).toLocaleString()}
            </p>
          </div>
          {v.versionNumber !== currentVersion ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={rolling === v.versionNumber}
              onClick={() => {
                setRolling(v.versionNumber);
                void rollbackOrientationVersion(packageId, v.versionNumber)
                  .then(() => {
                    reload();
                    onRollback?.();
                  })
                  .finally(() => setRolling(null));
              }}
            >
              {rolling === v.versionNumber ? "Rolling back…" : "Rollback"}
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
