import { PmUnifiedHazardCategory, PmUnifiedHazardScope, PmUnifiedHazardType, PmUnifiedHcIngestSource } from '@prisma/client';
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
export declare class HazardIngestionEngine {
    normalizeKey(title: string, description: string): string;
    isDuplicate(keyA: string, keyB: string): boolean;
    fromJhaHazard(h: {
        id: string;
        description: string;
        severity?: number | null;
        likelihood?: number | null;
        sifIndicator?: boolean | null;
        category?: string | null;
    }, ctx: {
        companyId: number;
        projectId: number;
    }): NormalizedHazard;
    fromCompanyLibrary(h: {
        id: string;
        title: string;
        description: string;
        category: string;
        subcategory?: string | null;
        severity: number;
        likelihood: number;
    }, companyId: number): NormalizedHazard;
    fromProjectLibrary(h: {
        id: string;
        title: string;
        description: string;
        category: string;
        severity: number;
        likelihood: number;
    }, ctx: {
        companyId: number;
        projectId: number;
    }): NormalizedHazard;
    fromInspectionDeficiency(d: {
        id: string;
        title: string;
        description?: string | null;
        severity?: string | null;
    }, ctx: {
        companyId: number;
        projectId: number;
    }): NormalizedHazard;
    fromPmTask(t: {
        id: string;
        title: string;
        blockedReason?: string | null;
    }, ctx: {
        companyId: number;
        projectId: number;
    }): NormalizedHazard;
    fromIncident(e: {
        id: string;
        title: string;
        description?: string | null;
        severity?: string | null;
    }, ctx: {
        companyId: number;
        projectId?: number;
    }): NormalizedHazard;
}
