import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService, PrismaService],
  exports: [SupervisorService],
})
export class SupervisorModule {}
