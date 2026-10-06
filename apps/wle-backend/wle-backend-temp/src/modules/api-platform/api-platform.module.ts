import {
  MiddlewareConsumer,
  Module,
  NestModule,
  forwardRef,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { WorkersModule } from '../../workers/workers.module';
import { CompaniesModule } from '../../companies/companies.module';
import { VeraCoreModule } from '../vera-core/vera-core.module';
import { EquipmentCoreModule } from '../equipment-core/equipment-core.module';
import { InspectionCoreModule } from '../inspection-core/inspection-core.module';
import { ReportingCoreModule } from '../reporting-core/reporting-core.module';
import { VerificationModule } from '../../verification/verification.module';
import { QrModule } from '../../qr/qr.module';
import { FieldSyncModule } from '../field-sync/field-sync.module';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { OfflineSyncMiddleware } from './middleware/offline-sync.middleware';
import { DomainEventBusModule } from './events/domain-event-bus.module';
import { ComplianceEventHandler } from './events/handlers/compliance-event.handler';
import { NotificationEventHandler } from './events/handlers/notification-event.handler';
import {
  WorkerRepository,
  EquipmentRepository,
  CompanyRepository,
  ProjectRepository,
  TrainingRepository,
  InspectionRepository,
  ComplianceRepository,
} from './repositories';
import {
  WorkerApiService,
  EquipmentApiService,
  ComplianceApiService,
  SyncApiService,
  ProjectApiService,
  CompanyApiService,
  QrApiService,
} from './services';
import { WorkersApiController } from './controllers/workers-api.controller';
import { EquipmentApiController } from './controllers/equipment-api.controller';
import { ComplianceApiController } from './controllers/compliance-api.controller';
import {
  SyncApiController,
  DashboardApiController,
} from './controllers/sync-api.controller';
import { ProjectsApiController } from './controllers/projects-api.controller';
import { CompaniesApiController } from './controllers/companies-api.controller';
import { QrApiController } from './controllers/qr-api.controller';
import { ContractsApiController } from './controllers/contracts-api.controller';
import { ApiPlatformScheduler } from './jobs/api-platform.scheduler';
import { CompanyScopeGuard } from './guards/company-scope.guard';
import { ProjectScopeGuard } from './guards/project-scope.guard';
import { ProjectComplianceModule } from '../project-compliance/project-compliance.module';

@Module({
  imports: [
    DomainEventBusModule,
    PrismaModule,
    forwardRef(() => WorkersModule),
    CompaniesModule,
    forwardRef(() => VeraCoreModule),
    forwardRef(() => EquipmentCoreModule),
    forwardRef(() => InspectionCoreModule),
    forwardRef(() => ReportingCoreModule),
    forwardRef(() => VerificationModule),
    forwardRef(() => QrModule),
    forwardRef(() => FieldSyncModule),
    DashboardWidgetsModule,
    AnalyticsModule,
    ProjectComplianceModule,
  ],
  controllers: [
    WorkersApiController,
    EquipmentApiController,
    ComplianceApiController,
    SyncApiController,
    DashboardApiController,
    ProjectsApiController,
    CompaniesApiController,
    QrApiController,
    ContractsApiController,
  ],
  providers: [
    ComplianceEventHandler,
    NotificationEventHandler,
    WorkerRepository,
    EquipmentRepository,
    CompanyRepository,
    ProjectRepository,
    TrainingRepository,
    InspectionRepository,
    ComplianceRepository,
    WorkerApiService,
    EquipmentApiService,
    ComplianceApiService,
    SyncApiService,
    ProjectApiService,
    CompanyApiService,
    QrApiService,
    ApiPlatformScheduler,
    CompanyScopeGuard,
    ProjectScopeGuard,
  ],
  exports: [
    DomainEventBusModule,
    WorkerApiService,
    EquipmentApiService,
    ComplianceApiService,
  ],
})
export class ApiPlatformModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OfflineSyncMiddleware).forRoutes('api/v1/*');
  }
}
