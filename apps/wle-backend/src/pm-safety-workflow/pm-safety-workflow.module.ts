import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyWorkflowController } from './pm-safety-workflow.controller';
import { PmSafetyWorkflowService } from './pm-safety-workflow.service';

@Module({
  controllers: [PmSafetyWorkflowController],
  providers: [PmSafetyWorkflowService, PrismaService],
  exports: [PmSafetyWorkflowService],
})
export class PmSafetyWorkflowModule {}
