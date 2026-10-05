import { Request } from 'express';
import { AuditLogService } from '../../audit/audit-log.service';
import { ProjectComplianceAlertsService } from './project-compliance-alerts.service';
import { ProjectComplianceService } from './project-compliance.service';
import { CreateComplianceRuleDto } from './dto/create-compliance-rule.dto';
type AuthReq = Request & {
    user?: {
        id: number;
        companyId?: number | null;
    };
};
export declare class ProjectComplianceController {
    private readonly compliance;
    private readonly alerts;
    private readonly audit;
    constructor(compliance: ProjectComplianceService, alerts: ProjectComplianceAlertsService, audit: AuditLogService);
    projectCompliance(id: number): Promise<import("./project-compliance.types").ProjectComplianceReport>;
    workerCompliance(id: number, workerId: number): Promise<import("./project-compliance.types").WorkerProjectComplianceDetail>;
    listAlerts(id: number, includeResolved?: string): Promise<import("./project-compliance.types").ComplianceAlertRow[]>;
    resolveAlert(id: number, alertId: number, req: AuthReq): Promise<{
        id: number;
        projectId: number;
        workerId: number;
        ruleId: number | null;
        credentialId: number | null;
        type: import(".prisma/client").$Enums.ProjectComplianceAlertType;
        createdAt: Date;
        resolvedAt: Date | null;
    }>;
    listRules(id: number): Promise<({
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRule(id: number, body: CreateComplianceRuleDto, req: AuthReq): Promise<{
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
