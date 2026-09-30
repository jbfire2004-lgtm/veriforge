"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldMode } from "@/components/field/FieldModeProvider";
import {
  groupPhotoDisplaysByItem,
  mergeInspectionPhotoDisplays,
  type GroupedPhotoDisplays,
  type InspectionPhotoDisplayItem,
} from "./inspection-photo-findings";
import { listPendingInspectionPhotos } from "./inspection-pending-photos";
import type { PmInspectionPhotoFinding } from "./pm-inspections";
import type { PmInspectionTemplate } from "./pm-inspections";

type Item = PmInspectionTemplate["items"][number];

export function useInspectionPhotoFindings(
  inspectionId: string | undefined,
  serverFindings: PmInspectionPhotoFinding[],
  items: Item[],
): {
  grouped: GroupedPhotoDisplays;
  displays: InspectionPhotoDisplayItem[];
  pendingCount: number;
  isOnline: boolean;
  syncing: boolean;
  refreshPending: () => Promise<void>;
} {
  const { cache, queue, pendingCount, syncing, isOnline } = useFieldMode();
  const [pendingDisplays, setPendingDisplays] = useState<InspectionPhotoDisplayItem[]>(
    [],
  );

  const refreshPending = useCallback(async () => {
    if (!inspectionId || !queue) {
      setPendingDisplays([]);
      return;
    }
    const rows = await listPendingInspectionPhotos(queue, cache, inspectionId);
    setPendingDisplays(rows);
  }, [cache, inspectionId, queue]);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending, pendingCount, syncing, serverFindings.length]);

  const displays = useMemo(
    () => mergeInspectionPhotoDisplays(serverFindings, pendingDisplays),
    [pendingDisplays, serverFindings],
  );

  const grouped = useMemo(
    () => groupPhotoDisplaysByItem(displays, items),
    [displays, items],
  );

  return {
    grouped,
    displays,
    pendingCount: pendingDisplays.length,
    isOnline,
    syncing,
    refreshPending,
  };
}
