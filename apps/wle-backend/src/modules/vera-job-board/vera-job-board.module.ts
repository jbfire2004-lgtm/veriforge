import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JobBoardController } from './job-board.controller';
import { JobBoardService } from './job-board.service';
import { JobBoardWorkerService } from './job-board-worker.service';

@Module({
  imports: [PrismaModule],
  controllers: [JobBoardController],
  providers: [JobBoardService, JobBoardWorkerService],
  exports: [JobBoardService, JobBoardWorkerService],
})
export class VeraJobBoardModule {}
