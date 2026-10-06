import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipmentComplianceModule } from '../modules/equipment-compliance/equipment-compliance.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmEquipmentSafetyController } from './pm-equipment-safety.controller';
import { PmEquipmentController } from './pm-equipment.controller';
import { PmEquipmentSafetyService } from './pm-equipment-safety.service';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';

@Module({
  imports: [PrismaModule, EquipmentComplianceModule, PmCorrectiveActionsModule],
  controllers: [PmEquipmentSafetyController, PmEquipmentController],
  providers: [PmEquipmentSafetyService, PmEquipmentCailIntelligenceService],
  exports: [PmEquipmentSafetyService, PmEquipmentCailIntelligenceService],
})
export class PmEquipmentSafetyModule {}
