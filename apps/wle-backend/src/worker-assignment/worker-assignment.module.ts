import { Module } from '@nestjs/common';
import { WorkerAssignmentController } from './worker-assignment.controller';
import { WorkerAssignmentService } from './worker-assignment.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WorkerAssignmentController],
  providers: [WorkerAssignmentService, PrismaService],
  exports: [WorkerAssignmentService],
})
export class WorkerAssignmentModule {}
