import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';
import { ProjectComplianceAlertsService } from './project-compliance-alerts.service';
import { ProjectComplianceController } from './project-compliance.controller';
import { ProjectComplianceService } from './project-compliance.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ProjectComplianceController],
  providers: [ProjectComplianceService, ProjectComplianceAlertsService],
  exports: [ProjectComplianceService, ProjectComplianceAlertsService],
})
export class ProjectComplianceModule {}
