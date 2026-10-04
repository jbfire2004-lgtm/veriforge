import { Module } from '@nestjs/common';
import { EquipmentAssignmentsController } from './equipment-assignments.controller';
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentAssignmentsController],
  providers: [EquipmentAssignmentsService],
  exports: [EquipmentAssignmentsService],
})
export class EquipmentAssignmentsModule {}
