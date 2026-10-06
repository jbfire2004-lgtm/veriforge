import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VeraCoreModule } from '../vera-core/vera-core.module';
import { CompetencyModule } from '../competency/competency.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { EquipmentCoreController } from './equipment-core.controller';
import { EquipmentCoreService } from './equipment-core.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => VeraCoreModule),
    CompetencyModule,
    EquipmentComplianceModule,
  ],
  controllers: [EquipmentCoreController],
  providers: [EquipmentCoreService],
  exports: [EquipmentCoreService],
})
export class EquipmentCoreModule {}
