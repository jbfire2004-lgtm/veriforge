import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationsService } from './investigations.service';
import { InvestigationsController } from './investigations.controller';

@Module({
  providers: [PrismaService, InvestigationsService],
  controllers: [InvestigationsController],
  exports: [InvestigationsService],
})
export class InvestigationsModule {}
