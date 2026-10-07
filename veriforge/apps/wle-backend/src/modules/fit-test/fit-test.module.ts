import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FitTestController } from './fit-test.controller';
import { FitTestService } from './fit-test.service';

@Module({
  imports: [PrismaModule],
  controllers: [FitTestController],
  providers: [FitTestService],
  exports: [FitTestService],
})
export class FitTestModule {}
