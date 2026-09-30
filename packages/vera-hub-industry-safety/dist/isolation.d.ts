import { type CompanySubtype, type DataPlane, type IsolationErrorCode, type ProjectSubtype } from "./types";
export declare class PlaneIsolationError extends Error {
    readonly code: IsolationErrorCode;
    constructor(code: IsolationErrorCode, message: string);
}
/**
 * Cross-category isolation: project and company planes never mix
 * unless an explicit cross-compare consent path is used.
 */
export declare function assertSinglePlane(entityType: DataPlane, filters: {
    projectType?: string;
    projectId?: string;
    companyType?: string;
    companyId?: string;
    entityType?: string;
}): void;
export declare function assertSubtypeMatchesPlane(entityType: DataPlane, subtype: string): void;
export declare function assertNoCrossPlaneTokenJoin(projectTokens: string[], companyTokens: string[]): void;
export declare function assertCrossCompareConsent(input: {
    explicitConsent?: boolean;
    hasPermission?: boolean;
}): void;
/**
 * Within the company plane: do not mix company types (e.g. utility vs contractor)
 * unless the user explicitly opts into cross-category comparison.
 */
export declare function assertSameCompanyTypeUnlessConsent(input: {
    homeType: string;
    benchmarkType: string;
    explicitCrossCategory?: boolean;
}): void;
/**
 * Do not mix mega with small (etc.) unless the user explicitly opts into cross-scale.
 */
export declare function assertSameScaleUnlessConsent(input: {
    homeScale: string;
    benchmarkScale: string;
    explicitCrossScale?: boolean;
}): void;
export declare function isProjectSubtype(value: string): value is ProjectSubtype;
export declare function isCompanySubtype(value: string): value is CompanySubtype;
/**
 * Partition facts so aggregators cannot accidentally union planes.
 */
export declare function partitionByPlane<T extends {
    plane: DataPlane;
}>(rows: T[]): {
    project: T[];
    company: T[];
};
