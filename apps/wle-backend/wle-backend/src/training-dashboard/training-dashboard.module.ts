import { Module } from '@nestjs/common';
import { TrainingDashboardController } from './training-dashboard.controller';
import { TrainingDashboardService } from './training-dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [VerificationModule],
  controllers: [TrainingDashboardController],
  providers: [TrainingDashboardService, PrismaService],
})
export class TrainingDashboardModule {}
