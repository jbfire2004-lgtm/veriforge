import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { MaintenanceCalibrationCoreController } from './maintenance-calibration-core.controller';
import { MaintenanceCalibrationCoreService } from './maintenance-calibration-core.service';

@Module({
  imports: [PrismaModule, EquipmentComplianceModule],
  controllers: [MaintenanceCalibrationCoreController],
  providers: [MaintenanceCalibrationCoreService],
  exports: [MaintenanceCalibrationCoreService],
})
export class MaintenanceCalibrationCoreModule {}
