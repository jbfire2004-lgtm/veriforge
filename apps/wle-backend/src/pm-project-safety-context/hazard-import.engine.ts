import { PmProjectHazardCategory } from '@prisma/client';

export type ImportedHazard = {
  category: PmProjectHazardCategory;
  title: string;
  description: string;
  severity: number;
  likelihood: number;
  sifPotential: boolean;
  hecaCategoryKey?: string;
  sourceType: string;
  sourceId?: string;
  subcategory?: string;
};

const CATEGORY_MAP: Record<string, PmProjectHazardCategory> = {
  energy: 'energy',
  environmental: 'environmental',
  equipment: 'equipment',
  chemical: 'chemical',
  behavioral: 'behavioral',
  site: 'site_specific',
  site_specific: 'site_specific',
};

export class HazardImportEngine {
  mapCompanyLibrary(entry: {
    category: string;
    subcategory?: string | null;
    description: string;
    defaultSeverity: number;
    defaultLikelihood: number;
  }): ImportedHazard {
    return {
      category: CATEGORY_MAP[entry.category.toLowerCase()] ?? 'site_specific',
      title: entry.subcategory ?? entry.category,
      description: entry.description,
      severity: entry.defaultSeverity,
      likelihood: entry.defaultLikelihood,
      sifPotential: entry.defaultSeverity >= 4 && entry.defaultLikelihood >= 4,
      sourceType: 'company_library',
    };
  }

  mapJhaHazard(h: {
    id: string;
    description: string;
    severity?: number | null;
    likelihood?: number | null;
    sifIndicator?: boolean | null;
  }): ImportedHazard {
    return {
      category: 'energy',
      title: 'JHA hazard',
      description: h.description,
      severity: h.severity ?? 3,
      likelihood: h.likelihood ?? 3,
      sifPotential: !!h.sifIndicator,
      sourceType: 'jha_flha',
      sourceId: h.id,
    };
  }

  mapInspectionDeficiency(d: {
    id: string;
    title: string;
    description?: string | null;
    severity?: string | null;
  }): ImportedHazard {
    const sev = d.severity === 'critical' ? 5 : d.severity === 'high' ? 4 : 3;
    return {
      category: 'equipment',
      title: d.title,
      description: d.description ?? d.title,
      severity: sev,
      likelihood: 3,
      sifPotential: sev >= 4,
      sourceType: 'inspection',
      sourceId: d.id,
    };
  }

  mapIncident(i: {
    id: string;
    title?: string | null;
    description?: string | null;
    severity?: string | null;
  }): ImportedHazard {
    return {
      category: 'behavioral',
      title: i.title ?? 'Incident hazard',
      description: i.description ?? 'Imported from incident',
      severity: 4,
      likelihood: 3,
      sifPotential: true,
      sourceType: 'incident',
      sourceId: i.id,
    };
  }

  mapEquipmentFailure(f: {
    id: string;
    title: string;
    description?: string | null;
    failureType?: string | null;
  }): ImportedHazard {
    const critical =
      f.failureType === 'safety_device' || f.failureType === 'structural';
    return {
      category: 'equipment',
      title: f.title,
      description: f.description ?? f.title,
      severity: critical ? 5 : 4,
      likelihood: 4,
      sifPotential: critical,
      sourceType: 'equipment_failure',
      sourceId: f.id,
    };
  }

  dedupeKey(h: ImportedHazard): string {
    return `${h.sourceType}:${h.title}:${h.description.slice(0, 80)}`;
  }
}
