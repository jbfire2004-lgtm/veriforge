import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { Phase1DashboardController } from './phase1-dashboard.controller';
import { Phase1DashboardService } from './phase1-dashboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [Phase1DashboardController],
  providers: [Phase1DashboardService],
})
export class Phase1DashboardModule {}
