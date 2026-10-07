import { Module } from '@nestjs/common';
import { MobileScanController } from './mobile-scan.controller';
import { MobileScanService } from './mobile-scan.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationModule } from '../verification/verification.module';
import { CombinedModule } from '../combined/combined.module';

@Module({
  imports: [VerificationModule, CombinedModule],
  controllers: [MobileScanController],
  providers: [MobileScanService, PrismaService],
  exports: [MobileScanService],
})
export class MobileScanModule {}
