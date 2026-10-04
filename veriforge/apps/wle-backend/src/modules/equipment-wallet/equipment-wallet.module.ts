import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CompetencyModule } from '../competency/competency.module';
import { MaintenanceCalibrationCoreModule } from '../maintenance-calibration-core/maintenance-calibration-core.module';
import { EquipmentWalletController } from './equipment-wallet.controller';
import { EquipmentWalletService } from './equipment-wallet.service';

@Module({
  imports: [PrismaModule, CompetencyModule, MaintenanceCalibrationCoreModule],
  controllers: [EquipmentWalletController],
  providers: [EquipmentWalletService],
  exports: [EquipmentWalletService],
})
export class EquipmentWalletModule {}
