import { Module } from '@nestjs/common';
import { EquipmentTrainingRequirementsController } from './equipment-training-requirements.controller';
import { EquipmentTrainingRequirementsService } from './equipment-training-requirements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentTrainingRequirementsController],
  providers: [EquipmentTrainingRequirementsService],
  exports: [EquipmentTrainingRequirementsService],
})
export class EquipmentTrainingRequirementsModule {}
