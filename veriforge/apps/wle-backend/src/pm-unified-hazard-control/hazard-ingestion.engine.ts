import {
  PmUnifiedHazardCategory,
  PmUnifiedHazardScope,
  PmUnifiedHazardType,
  PmUnifiedHcIngestSource,
} from '@prisma/client';

export type NormalizedHazard = {
  title: string;
  description: string;
  category: PmUnifiedHazardCategory;
  hazardType: PmUnifiedHazardType;
  subcategory?: string;
  severity: number;
  likelihood: number;
  sourceType: PmUnifiedHcIngestSource;
  sourceId?: string;
  scopeLevel: PmUnifiedHazardScope;
  projectId?: number;
  taskId?: string;
  workPackageId?: string;
  workerId?: number;
  legacyCompanyHazardId?: string;
  legacyProjectHazardId?: string;
};

const CATEGORY_MAP: Record<string, PmUnifiedHazardCategory> = {
  energy: 'energy',
  environmental: 'environmental',
  equipment: 'equipment',
  chemical: 'chemical',
  behavioral: 'behavioral',
  site: 'site_specific',
  site_specific: 'site_specific',
};

export class HazardIngestionEngine {
  normalizeKey(title: string, description: string): string {
    return `${title.toLowerCase().trim()}|${description
      .toLowerCase()
      .slice(0, 80)
      .trim()}`;
  }

  isDuplicate(keyA: string, keyB: string): boolean {
    if (keyA === keyB) return true;
    const [ta] = keyA.split('|');
    const [tb] = keyB.split('|');
    return ta === tb;
  }

  fromJhaHazard(
    h: {
      id: string;
      description: string;
      severity?: number | null;
      likelihood?: number | null;
      sifIndicator?: boolean | null;
      category?: string | null;
    },
    ctx: { companyId: number; projectId: number },
  ): NormalizedHazard {
    return {
      title: 'JHA hazard',
      description: h.description,
      category:
        CATEGORY_MAP[(h.category ?? 'energy').toLowerCase()] ?? 'energy',
      hazardType: 'physical',
      severity: h.severity ?? 3,
      likelihood: h.likelihood ?? 3,
      sourceType: 'jha_flha',
      sourceId: h.id,
      scopeLevel: 'project',
      projectId: ctx.projectId,
    };
  }

  fromCompanyLibrary(
    h: {
      id: string;
      title: string;
      description: string;
      category: string;
      subcategory?: string | null;
      severity: number;
      likelihood: number;
    },
    companyId: number,
  ): NormalizedHazard {
    return {
      title: h.title,
      description: h.description,
      category: CATEGORY_MAP[h.category.toLowerCase()] ?? 'site_specific',
      hazardType: h.category === 'chemical' ? 'chemical' : 'physical',
      subcategory: h.subcategory ?? undefined,
      severity: h.severity,
      likelihood: h.likelihood,
      sourceType: 'company_library',
      sourceId: h.id,
      scopeLevel: 'company',
      legacyCompanyHazardId: h.id,
    };
  }

  fromProjectLibrary(
    h: {
      id: string;
      title: string;
      description: string;
      category: string;
      severity: number;
      likelihood: number;
    },
    ctx: { companyId: number; projectId: number },
  ): NormalizedHazard {
    return {
      title: h.title,
      description: h.description,
      category: CATEGORY_MAP[h.category.toLowerCase()] ?? 'site_specific',
      hazardType: 'environmental',
      severity: h.severity,
      likelihood: h.likelihood,
      sourceType: 'project_library',
      sourceId: h.id,
      scopeLevel: 'project',
      projectId: ctx.projectId,
      legacyProjectHazardId: h.id,
    };
  }

  fromInspectionDeficiency(
    d: {
      id: string;
      title: string;
      description?: string | null;
      severity?: string | null;
    },
    ctx: { companyId: number; projectId: number },
  ): NormalizedHazard {
    const sevRaw = String(d.severity ?? 'medium').toLowerCase();
    const sev = sevRaw === 'critical' ? 5 : sevRaw === 'high' ? 4 : 3;
    return {
      title: d.title,
      description: d.description ?? d.title,
      category: 'equipment',
      hazardType: 'equipment',
      severity: sev,
      likelihood: 3,
      sourceType: 'inspection',
      sourceId: d.id,
      scopeLevel: 'project',
      projectId: ctx.projectId,
    };
  }

  fromPmTask(
    t: {
      id: string;
      title: string;
      blockedReason?: string | null;
    },
    ctx: { companyId: number; projectId: number },
  ): NormalizedHazard {
    return {
      title: `Task hazard: ${t.title}`,
      description: t.blockedReason ?? `Safety-gated task ${t.title}`,
      category: 'behavioral',
      hazardType: 'procedural',
      severity: 4,
      likelihood: 3,
      sourceType: 'pm_task',
      sourceId: t.id,
      scopeLevel: 'task',
      projectId: ctx.projectId,
      taskId: t.id,
    };
  }

  fromIncident(
    e: {
      id: string;
      title: string;
      description?: string | null;
      severity?: string | null;
    },
    ctx: { companyId: number; projectId?: number },
  ): NormalizedHazard {
    const sevRaw = String(e.severity ?? 'medium').toLowerCase();
    const sev = sevRaw === 'critical' ? 5 : sevRaw === 'high' ? 4 : 3;
    return {
      title: e.title,
      description: e.description ?? e.title,
      category: 'site_specific',
      hazardType: 'physical',
      severity: sev,
      likelihood: 4,
      sourceType: 'incident',
      sourceId: e.id,
      scopeLevel: ctx.projectId ? 'project' : 'company',
      projectId: ctx.projectId,
    };
  }
}
