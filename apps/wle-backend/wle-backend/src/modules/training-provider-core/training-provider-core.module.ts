import { Module, forwardRef } from '@nestjs/common';
import { Phase1MonitoringModule } from '../../common/monitoring/phase1-monitoring.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { VeraCoreModule } from '../vera-core/vera-core.module';
import { TrainingStandardsComplianceModule } from '../training-standards-compliance/training-standards-compliance.module';
import { TrainingProviderCoreController } from './training-provider-core.controller';
import { TrainingProviderCoreService } from './training-provider-core.service';
import { TrainingProviderAccessService } from './training-provider-access.service';
import { TrainingProviderComplianceService } from './training-provider-compliance.service';
import { TrainingProviderCertificateService } from './training-provider-certificate.service';

@Module({
  imports: [
    PrismaModule,
    Phase1MonitoringModule,
    forwardRef(() => VeraCoreModule),
    TrainingStandardsComplianceModule,
  ],
  controllers: [TrainingProviderCoreController],
  providers: [
    TrainingProviderCoreService,
    TrainingProviderAccessService,
    TrainingProviderComplianceService,
    TrainingProviderCertificateService,
  ],
  exports: [
    TrainingProviderCoreService,
    TrainingProviderAccessService,
    TrainingProviderComplianceService,
    TrainingProviderCertificateService,
  ],
})
export class TrainingProviderCoreModule {}
