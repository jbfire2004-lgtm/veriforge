import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceService } from './compliance.service';

@Module({
  providers: [ComplianceService, PrismaService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
