import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InactivationModule } from '../vera-core/inactivation.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { SafetyIntelligenceModule } from '../../safety-intelligence/safety-intelligence.module';
import { InspectionCoreController } from './inspection-core.controller';
import { InspectionCoreService } from './inspection-core.service';

@Module({
  imports: [
    PrismaModule,
    InactivationModule,
    EquipmentComplianceModule,
    forwardRef(() => SafetyIntelligenceModule),
  ],
  controllers: [InspectionCoreController],
  providers: [InspectionCoreService],
  exports: [InspectionCoreService],
})
export class InspectionCoreModule {}
