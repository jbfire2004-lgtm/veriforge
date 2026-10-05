import { AnalyticsService } from '../../analytics/analytics.service';
import { AssignmentDashboardService } from '../../assignment-dashboard/assignment-dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardWidgetsBundle } from './dashboard-widgets.types';
import { DispatchPipeline } from './pipelines/dispatch.pipeline';
import { EquipmentCompliancePipeline } from './pipelines/equipment-compliance.pipeline';
import { ProjectReadinessPipeline } from './pipelines/project-readiness.pipeline';
import { ProviderApprovalPipeline } from './pipelines/provider-approval.pipeline';
import { TrainingExpiryPipeline } from './pipelines/training-expiry.pipeline';
import { WorkerCompliancePipeline } from './pipelines/worker-compliance.pipeline';
export type DashboardWidgetScope = {
    companyId?: number;
    unionHallId?: number;
    includeWorkerCompliance?: boolean;
    includeEquipmentCompliance?: boolean;
    includeTrainingExpiry?: boolean;
    includeProjectReadiness?: boolean;
    includeProviderApprovals?: boolean;
    includeUnionDispatch?: boolean;
    includeSystemHealth?: boolean;
    includeAssignments?: boolean;
};
export declare class DashboardWidgetsService {
    private readonly prisma;
    private readonly analytics;
    private readonly assignments;
    private readonly workerCompliance;
    private readonly equipmentCompliance;
    private readonly trainingExpiry;
    private readonly projectReadiness;
    private readonly providerApproval;
    private readonly dispatch;
    constructor(prisma: PrismaService, analytics: AnalyticsService, assignments: AssignmentDashboardService, workerCompliance: WorkerCompliancePipeline, equipmentCompliance: EquipmentCompliancePipeline, trainingExpiry: TrainingExpiryPipeline, projectReadiness: ProjectReadinessPipeline, providerApproval: ProviderApprovalPipeline, dispatch: DispatchPipeline);
    getBundle(scope: DashboardWidgetScope): Promise<DashboardWidgetsBundle>;
    private buildSystemHealth;
    private buildAssignments;
}
