import { type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ProjectComplianceReport, RuleMetadata, WorkerProjectComplianceDetail } from './project-compliance.types';
export declare class ProjectComplianceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    evaluateProject(projectId: number): Promise<ProjectComplianceReport>;
    evaluateWorkerOnProject(projectId: number, workerId: number): Promise<WorkerProjectComplianceDetail>;
    listRules(projectId: number): Promise<({
        certification: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        projectId: number;
        companyId: number;
        ruleType: import(".prisma/client").$Enums.ProjectComplianceRuleType;
        requiredCredentialTypeId: number;
        metadata: Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRule(projectId: number, body: {
        ruleType: Prisma.ProjectComplianceRuleCreateInput['ruleType'];
        requiredCredentialTypeId: number;
        metadata?: RuleMetadata;
    }): Promise<{
        certification: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        projectId: number;
        companyId: number;
        ruleType: import(".prisma/client").$Enums.ProjectComplianceRuleType;
        requiredCredentialTypeId: number;
        metadata: Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private loadRules;
}
