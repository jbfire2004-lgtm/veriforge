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
export declare class HazardImportEngine {
    mapCompanyLibrary(entry: {
        category: string;
        subcategory?: string | null;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
    }): ImportedHazard;
    mapJhaHazard(h: {
        id: string;
        description: string;
        severity?: number | null;
        likelihood?: number | null;
        sifIndicator?: boolean | null;
    }): ImportedHazard;
    mapInspectionDeficiency(d: {
        id: string;
        title: string;
        description?: string | null;
        severity?: string | null;
    }): ImportedHazard;
    mapIncident(i: {
        id: string;
        title?: string | null;
        description?: string | null;
        severity?: string | null;
    }): ImportedHazard;
    mapEquipmentFailure(f: {
        id: string;
        title: string;
        description?: string | null;
        failureType?: string | null;
    }): ImportedHazard;
    dedupeKey(h: ImportedHazard): string;
}
