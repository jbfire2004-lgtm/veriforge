import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { AssignmentDashboardModule } from '../../assignment-dashboard/assignment-dashboard.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { DashboardWidgetsController } from './dashboard-widgets.controller';
import { DashboardWidgetsService } from './dashboard-widgets.service';
import { DispatchPipeline } from './pipelines/dispatch.pipeline';
import { EquipmentCompliancePipeline } from './pipelines/equipment-compliance.pipeline';
import { ProjectReadinessPipeline } from './pipelines/project-readiness.pipeline';
import { ProviderApprovalPipeline } from './pipelines/provider-approval.pipeline';
import { TrainingExpiryPipeline } from './pipelines/training-expiry.pipeline';
import { WorkerCompliancePipeline } from './pipelines/worker-compliance.pipeline';

@Module({
  imports: [
    PrismaModule,
    ReportingCoreModule,
    AnalyticsModule,
    AssignmentDashboardModule,
  ],
  controllers: [DashboardWidgetsController],
  providers: [
    DashboardWidgetsService,
    WorkerCompliancePipeline,
    EquipmentCompliancePipeline,
    TrainingExpiryPipeline,
    ProjectReadinessPipeline,
    ProviderApprovalPipeline,
    DispatchPipeline,
  ],
  exports: [DashboardWidgetsService],
})
export class DashboardWidgetsModule {}
