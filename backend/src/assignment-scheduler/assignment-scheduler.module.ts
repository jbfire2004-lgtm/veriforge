import { Module } from '@nestjs/common';
import { AssignmentSchedulerController } from './assignment-scheduler.controller';
import { AssignmentSchedulerService } from './assignment-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentService } from '../assignment/assignment.service';

@Module({
  controllers: [AssignmentSchedulerController],
  providers: [AssignmentSchedulerService, AssignmentService, PrismaService],
  exports: [AssignmentSchedulerService],
})
export class AssignmentSchedulerModule {}
