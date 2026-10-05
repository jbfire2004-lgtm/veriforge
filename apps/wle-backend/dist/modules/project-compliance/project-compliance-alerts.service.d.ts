import { PrismaService } from '../../prisma/prisma.service';
import { ProjectComplianceService } from './project-compliance.service';
import type { ComplianceAlertRow } from './project-compliance.types';
export declare class ProjectComplianceAlertsService {
    private readonly prisma;
    private readonly compliance;
    constructor(prisma: PrismaService, compliance: ProjectComplianceService);
    listAlerts(projectId: number, options?: {
        includeResolved?: boolean;
    }): Promise<ComplianceAlertRow[]>;
    resolveAlert(projectId: number, alertId: number): Promise<{
        id: number;
        projectId: number;
        workerId: number;
        ruleId: number | null;
        credentialId: number | null;
        type: import(".prisma/client").$Enums.ProjectComplianceAlertType;
        createdAt: Date;
        resolvedAt: Date | null;
    }>;
    onWorkerAssigned(projectId: number, workerId: number): Promise<void>;
    onWorkerCredentialChange(workerId: number): Promise<void>;
    syncAlertsForProject(projectId: number): Promise<void>;
    private syncAlertsForWorker;
    private resolveStaleAlerts;
    private gapToAlertType;
    private alertKey;
}
