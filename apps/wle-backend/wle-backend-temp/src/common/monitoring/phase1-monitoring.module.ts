import { Global, Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { Phase1MonitoringService } from './phase1-monitoring.service';

@Global()
@Module({
  imports: [AuditModule],
  providers: [Phase1MonitoringService],
  exports: [Phase1MonitoringService],
})
export class Phase1MonitoringModule {}
