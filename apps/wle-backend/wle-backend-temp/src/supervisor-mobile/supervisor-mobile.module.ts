import { Module } from '@nestjs/common';
import { SupervisorMobileController } from './supervisor-mobile.controller';
import { SupervisorMobileService } from './supervisor-mobile.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SupervisorMobileController],
  providers: [SupervisorMobileService, PrismaService],
  exports: [SupervisorMobileService],
})
export class SupervisorMobileModule {}
