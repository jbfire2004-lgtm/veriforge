import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceService } from '../compliance/compliance.service';

@Module({
  controllers: [ReportingController],
  providers: [ReportingService, PrismaService, ComplianceService],
  exports: [ReportingService],
})
export class ReportingModule {}
