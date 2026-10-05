import { PmSafetyWorkflowKind } from '@prisma/client';
export declare class CreatePmSafetyWorkflowDto {
    title: string;
    kind?: PmSafetyWorkflowKind;
    companyId?: number;
    siteId?: number;
    workDescription?: string;
    hazardSummary?: string;
    controlMeasures?: string;
    jobLocation?: string;
    taskStepsJson?: string;
    validFrom?: string;
    validTo?: string;
}
