import { NextResponse } from "next/server";
import { emptyDrill } from "@/lib/dashboard-analytics";
import type { ScopeType } from "@/lib/dashboard-analytics/types";
import { getDrill as getCoreDrill } from "@/lib/vericore-dashboard/store";
import { getDrill as getPmDrill } from "@/lib/veripm-dashboard/store";
import { getEvidence, getScore } from "@/lib/contractor-safety-score/store";

/**
 * Universal drill-down facade across VERICore, VERIPM, and CSS.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const metricId = url.searchParams.get("metricId") ?? url.searchParams.get("metricKey");
  const scopeType = (url.searchParams.get("scopeType") ?? "company") as ScopeType;
  const scopeId = url.searchParams.get("scopeId") ?? "1";
  const domain = url.searchParams.get("domain");

  if (!metricId) {
    return NextResponse.json({ error: "metricId required" }, { status: 400 });
  }

  // CSS
  if (domain === "CSS" || metricId.startsWith("contractor.")) {
    const contractorId = Number(scopeId);
    const score = getScore(contractorId);
    const evidence = getEvidence(contractorId);
    const shell = emptyDrill(metricId, scopeType, scopeId, {
      domain: "CSS",
      inputs: score
        ? Object.fromEntries(
            Object.values(score.pillars).map((p) => [p.id, p.score]),
          )
        : {},
      total: evidence.total,
      items: evidence.items.map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        status: e.status,
        occurredAt: e.occurredAt,
        href: e.href ?? "/core/contractor-scores",
        documentId: e.documentId,
        documentType: e.evidenceType,
        related: {
          contractorId: String(contractorId),
        },
      })),
    });
    return NextResponse.json(shell);
  }

  // VERIPM / permits
  if (
    domain === "VERIPM" ||
    metricId.startsWith("pm.") ||
    metricId.startsWith("asset.") ||
    metricId.startsWith("pm_safety.")
  ) {
    if (metricId.startsWith("pm.permits") || metricId.startsWith("sms.permits")) {
      const { drillPermits } = await import("@/lib/veripm-fieldos-permits/store");
      const drill = drillPermits(
        metricId,
        scopeType === "project" ? Number(scopeId) : undefined,
      );
      return NextResponse.json(
        emptyDrill(metricId, scopeType, scopeId, {
          domain: metricId.startsWith("sms.") ? "VERICORE" : "VERIPM",
          formula: drill.formula,
          formulaId: drill.formulaId,
          sourceQuery: drill.sourceQuery,
          inputs: drill.inputs,
          filters: drill.filters,
          total: drill.total,
          items: drill.items.map((i) => ({
            id: i.id,
            title: i.title,
            subtitle: i.subtitle,
            status: i.status,
            dueAt: i.dueAt,
            href: i.href,
            documentId: i.documentId,
            documentType: i.documentType,
            related: {
              assetId: i.related?.assetId != null ? String(i.related.assetId) : undefined,
              contractorId:
                i.related?.contractorId != null ? String(i.related.contractorId) : undefined,
              projectId:
                i.related?.projectId != null ? String(i.related.projectId) : undefined,
            },
          })),
        }),
      );
    }
    const drill = getPmDrill(metricId, {
      projectId: scopeType === "project" ? Number(scopeId) : undefined,
      assetId: scopeType === "asset" ? scopeId : undefined,
    });
    const shell = emptyDrill(metricId, scopeType, scopeId, {
      domain: "VERIPM",
      formula: drill.formula,
      formulaId: drill.formulaId,
      sourceQuery: drill.sourceQuery,
      inputs: drill.inputs,
      filters: drill.filters,
      total: drill.total,
      items: drill.items.map((i) => ({
        id: i.id,
        title: i.title,
        subtitle: i.subtitle,
        status: i.status,
        dueAt: i.dueAt,
        href: i.href,
        documentId: i.documentId,
        documentType: i.documentType,
        related: {
          assetId: i.related?.assetId != null ? String(i.related.assetId) : undefined,
          assetName: i.related?.assetName != null ? String(i.related.assetName) : undefined,
          workerName: i.related?.workerName != null ? String(i.related.workerName) : undefined,
          contractorId:
            i.related?.contractorId != null ? String(i.related.contractorId) : undefined,
          riskRating: i.related?.riskRating != null ? String(i.related.riskRating) : undefined,
        },
      })),
    });
    return NextResponse.json(shell);
  }

  // VERICore default
  const drill = getCoreDrill(metricId, {
    projectId: scopeType === "project" ? Number(scopeId) : undefined,
  });
  const shell = emptyDrill(metricId, scopeType, scopeId, {
    domain: "VERICORE",
    formula: drill.formula,
    formulaId: drill.formulaId,
    inputs: drill.inputs,
    filters: drill.filters,
    total: drill.total,
    items: drill.items.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      status: i.status,
      dueAt: i.dueAt,
      href: i.href,
      documentId: i.documentId,
      documentType: i.documentType,
      related: {
        workerId: i.meta?.workerId != null ? String(i.meta.workerId) : undefined,
      },
    })),
  });
  return NextResponse.json(shell);
}
