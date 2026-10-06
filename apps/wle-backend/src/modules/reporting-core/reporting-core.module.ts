import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VerificationModule } from '../../verification/verification.module';
import { CompetencyModule } from '../competency/competency.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { InspectionCoreModule } from '../inspection-core/inspection-core.module';
import { ReportingCoreController } from './reporting-core.controller';
import { ReportingCoreService } from './reporting-core.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => VerificationModule),
    EquipmentComplianceModule,
    CompetencyModule,
    forwardRef(() => InspectionCoreModule),
  ],
  controllers: [ReportingCoreController],
  providers: [ReportingCoreService],
  exports: [ReportingCoreService],
})
export class ReportingCoreModule {}
