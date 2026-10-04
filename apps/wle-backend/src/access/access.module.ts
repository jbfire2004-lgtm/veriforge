import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { VerificationModule } from '../verification/verification.module';

/**
 * Site access composes persistence + VerificationService (compliance evaluation).
 * Import VerificationModule so RuleEngine + Prisma wiring stay in one place.
 */
@Module({
  imports: [VerificationModule],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule {}
