import { Module } from '@nestjs/common';
import { AcpModule } from '../../acp/acp.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreDailyLogController } from './core-daily-log.controller';
import { CoreDailyLogService } from './core-daily-log.service';

@Module({
  imports: [AcpModule],
  controllers: [CoreDailyLogController],
  providers: [CoreDailyLogService, PrismaService],
  exports: [CoreDailyLogService],
})
export class CoreDailyLogModule {}
