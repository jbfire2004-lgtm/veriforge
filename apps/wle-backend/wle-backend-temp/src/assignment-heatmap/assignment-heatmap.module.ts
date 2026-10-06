import { Module } from '@nestjs/common';
import { AssignmentHeatmapController } from './assignment-heatmap.controller';
import { AssignmentHeatmapService } from './assignment-heatmap.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssignmentHeatmapController],
  providers: [AssignmentHeatmapService, PrismaService],
  exports: [AssignmentHeatmapService],
})
export class AssignmentHeatmapModule {}
