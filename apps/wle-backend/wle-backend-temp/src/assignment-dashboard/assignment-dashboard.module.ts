import { Module } from '@nestjs/common';
import { AssignmentDashboardController } from './assignment-dashboard.controller';
import { AssignmentDashboardService } from './assignment-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssignmentDashboardController],
  providers: [AssignmentDashboardService, PrismaService],
  exports: [AssignmentDashboardService],
})
export class AssignmentDashboardModule {}
