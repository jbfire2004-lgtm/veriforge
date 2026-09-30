import type { CompanyTwinState } from "../types";
export type CompanyTwinInput = {
    id: string;
    name: string;
    complianceRate?: number;
    workerCount?: number;
    equipmentCount?: number;
    projectCount?: number;
    providerCount?: number;
    unionHallIds?: string[];
};
export declare function buildCompanyTwin(input: CompanyTwinInput): CompanyTwinState;
//# sourceMappingURL=company-twin.d.ts.map