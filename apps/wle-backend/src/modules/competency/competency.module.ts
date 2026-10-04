import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EquipmentComplianceModule } from '../equipment-compliance/equipment-compliance.module';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';

@Module({
  imports: [PrismaModule, EquipmentComplianceModule],
  controllers: [CompetencyController],
  providers: [CompetencyService],
  exports: [CompetencyService],
})
export class CompetencyModule {}
