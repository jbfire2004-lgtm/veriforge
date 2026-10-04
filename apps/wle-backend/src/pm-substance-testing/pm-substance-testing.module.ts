import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmSubstanceTestingController } from './pm-substance-testing.controller';
import { PmSubstanceTestingService } from './pm-substance-testing.service';
import { PmSubstanceTestingCustodyService } from './pm-substance-testing-custody.service';
import { PmSubstanceTestingComplianceService } from './pm-substance-testing-compliance.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PmSubstanceTestingController],
  providers: [
    PmSubstanceTestingService,
    PmSubstanceTestingCustodyService,
    PmSubstanceTestingComplianceService,
  ],
  exports: [PmSubstanceTestingService],
})
export class PmSubstanceTestingModule {}
