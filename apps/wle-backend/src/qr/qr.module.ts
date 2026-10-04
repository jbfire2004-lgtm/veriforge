import { Module, forwardRef } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { CombinedModule } from '../combined/combined.module';
import { VerificationModule } from '../verification/verification.module';
import { TrainingProviderCertificateService } from '../modules/training-provider-core/training-provider-certificate.service';

@Module({
  imports: [CombinedModule, forwardRef(() => VerificationModule), PrismaModule],
  controllers: [QrController],
  providers: [QrService, PrismaService, TrainingProviderCertificateService],
  exports: [QrService],
})
export class QrModule {}
