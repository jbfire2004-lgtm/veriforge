import type { SyncStatus } from "./field/types";
import type { PmInspectionPhotoFinding } from "./pm-inspections";

type ChecklistItemRef = { id: string; type: string };

export type InspectionPhotoSyncState = SyncStatus | "synced";

export type InspectionPhotoDisplayItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  ocrText: string | null;
  hazardTags: string[];
  syncState: InspectionPhotoSyncState;
  checklistItemId: string | null;
  severity?: string;
  description?: string | null;
  correctiveActionTitle?: string | null;
  lastError?: string;
  sourceFinding?: PmInspectionPhotoFinding;
};

type AnalysisJson = {
  vision?: { ocr?: { fullText?: string }; summary?: { bullets?: string[] } };
  llm?: { hazardSummary?: string; ocrText?: string };
};

type AnnotationJson = { checklistItemId?: string };

export function photoFindingImageUrl(finding: PmInspectionPhotoFinding): string | null {
  const dataUrl = finding.attachment?.dataUrl;
  if (dataUrl?.startsWith("data:") || dataUrl?.startsWith("http")) {
    return dataUrl;
  }
  return null;
}

export function photoFindingOcrText(finding: PmInspectionPhotoFinding): string | null {
  const analysis = finding.attachment?.analysisJson as AnalysisJson | undefined;
  const ocr =
    analysis?.vision?.ocr?.fullText?.trim() ||
    analysis?.llm?.ocrText?.trim() ||
    (typeof finding.analysisJson?.llm === "string"
      ? finding.analysisJson.llm
      : null);
  if (ocr) return ocr;
  const bullets = analysis?.vision?.summary?.bullets;
  if (bullets?.length) return bullets.join(" · ");
  return finding.description?.trim() ?? null;
}

export function photoFindingHazardTags(finding: PmInspectionPhotoFinding): string[] {
  const tags = new Set<string>();
  tags.add(finding.category.replace(/_/g, " "));
  if (finding.severity) tags.add(finding.severity);
  if (finding.sclState) tags.add(`SCL:${finding.sclState}`);
  if (finding.hecaInvolved) {
    tags.add(finding.hecaType ? `HECA:${finding.hecaType}` : "HECA");
  }
  if (finding.hecaCategoryCode) tags.add(finding.hecaCategoryCode);
  if (finding.highEnergyFlag) tags.add("high energy");
  for (const energy of finding.energyTypes ?? []) {
    if (energy) tags.add(energy);
  }
  return [...tags];
}

export function resolveFindingChecklistItemId(
  finding: PmInspectionPhotoFinding,
): string | null {
  if (finding.checklistItemId) return finding.checklistItemId;
  const annotation = finding.attachment?.annotationJson as AnnotationJson | undefined;
  return annotation?.checklistItemId ?? null;
}

export type GroupedPhotoFindings = {
  byItemId: Map<string, PmInspectionPhotoFinding[]>;
  unassigned: PmInspectionPhotoFinding[];
};

/** Assign findings to checklist items; unlinked findings fall back to sole photo item. */
export function groupPhotoFindingsByItem(
  findings: PmInspectionPhotoFinding[],
  items: ChecklistItemRef[],
): GroupedPhotoFindings {
  const byItemId = new Map<string, PmInspectionPhotoFinding[]>();
  const unassigned: PmInspectionPhotoFinding[] = [];
  const itemIds = new Set(items.map((i) => i.id));

  for (const finding of findings) {
    const itemId = resolveFindingChecklistItemId(finding);
    if (itemId && itemIds.has(itemId)) {
      const list = byItemId.get(itemId) ?? [];
      list.push(finding);
      byItemId.set(itemId, list);
    } else {
      unassigned.push(finding);
    }
  }

  const photoItems = items.filter((i) => i.type === "photo");
  if (unassigned.length && photoItems.length === 1) {
    const target = photoItems[0]!.id;
    byItemId.set(target, [...(byItemId.get(target) ?? []), ...unassigned]);
    return { byItemId, unassigned: [] };
  }

  return { byItemId, unassigned };
}

export function findingsForChecklistItem(
  itemId: string,
  grouped: GroupedPhotoFindings,
): PmInspectionPhotoFinding[] {
  return grouped.byItemId.get(itemId) ?? [];
}

export function photoFindingToDisplayItem(
  finding: PmInspectionPhotoFinding,
): InspectionPhotoDisplayItem {
  const analysisStatus = finding.attachment?.analysisStatus;
  const syncState: InspectionPhotoSyncState =
    analysisStatus === "processing"
      ? "syncing"
      : analysisStatus === "failed"
        ? "failed"
        : "synced";

  return {
    id: finding.id,
    title: finding.title,
    imageUrl: photoFindingImageUrl(finding),
    ocrText: photoFindingOcrText(finding),
    hazardTags: photoFindingHazardTags(finding),
    syncState,
    checklistItemId: resolveFindingChecklistItemId(finding),
    severity: finding.severity,
    description: finding.description,
    correctiveActionTitle: finding.correctiveAction?.title ?? null,
    sourceFinding: finding,
  };
}

export function mapFindingsToDisplayItems(
  findings: PmInspectionPhotoFinding[],
): InspectionPhotoDisplayItem[] {
  return findings.map(photoFindingToDisplayItem);
}

export type GroupedPhotoDisplays = {
  byItemId: Map<string, InspectionPhotoDisplayItem[]>;
  unassigned: InspectionPhotoDisplayItem[];
};

export function groupPhotoDisplaysByItem(
  displays: InspectionPhotoDisplayItem[],
  items: ChecklistItemRef[],
): GroupedPhotoDisplays {
  const byItemId = new Map<string, InspectionPhotoDisplayItem[]>();
  const unassigned: InspectionPhotoDisplayItem[] = [];
  const itemIds = new Set(items.map((item) => item.id));

  for (const display of displays) {
    const itemId = display.checklistItemId;
    if (itemId && itemIds.has(itemId)) {
      const list = byItemId.get(itemId) ?? [];
      list.push(display);
      byItemId.set(itemId, list);
    } else {
      unassigned.push(display);
    }
  }

  const photoItems = items.filter((item) => item.type === "photo");
  if (unassigned.length && photoItems.length === 1) {
    const target = photoItems[0]!.id;
    byItemId.set(target, [...(byItemId.get(target) ?? []), ...unassigned]);
    return { byItemId, unassigned: [] };
  }

  return { byItemId, unassigned };
}

export function displaysForChecklistItem(
  itemId: string,
  grouped: GroupedPhotoDisplays,
): InspectionPhotoDisplayItem[] {
  return grouped.byItemId.get(itemId) ?? [];
}

export function mergeInspectionPhotoDisplays(
  findings: PmInspectionPhotoFinding[],
  pending: InspectionPhotoDisplayItem[],
): InspectionPhotoDisplayItem[] {
  return [...mapFindingsToDisplayItems(findings), ...pending];
}

export function syncStateLabel(state: InspectionPhotoSyncState): string {
  switch (state) {
    case "pending":
      return "Pending sync";
    case "syncing":
      return "Analyzing…";
    case "failed":
      return "Sync failed";
    case "synced":
      return "Synced";
    default:
      return state;
  }
}
