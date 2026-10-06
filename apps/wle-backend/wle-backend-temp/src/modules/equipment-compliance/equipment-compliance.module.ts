import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EquipmentComplianceController } from './equipment-compliance.controller';
import { EquipmentComplianceService } from './equipment-compliance.service';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentComplianceController],
  providers: [EquipmentComplianceService],
  exports: [EquipmentComplianceService],
})
export class EquipmentComplianceModule {}
