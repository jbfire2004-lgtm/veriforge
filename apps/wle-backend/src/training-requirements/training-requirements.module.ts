import { Module } from '@nestjs/common';
import { TrainingRequirementsController } from './training-requirements.controller';
import { TrainingRequirementsService } from './training-requirements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingRequirementsController],
  providers: [TrainingRequirementsService],
  exports: [TrainingRequirementsService],
})
export class TrainingRequirementsModule {}
