import { Module, forwardRef } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationCoreController } from './verification-core.controller';
import { VerificationActivityController } from './verification-activity.controller';
import { VerificationService } from './verification.service';
import { PublicTokenResolver } from './public-token.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineModule } from '../rules/rule-engine.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { TrainingCredentialNftModule } from '../modules/training-credential-nft/training-credential-nft.module';
import { TrainingStandardsComplianceModule } from '../modules/training-standards-compliance/training-standards-compliance.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    RuleEngineModule,
    forwardRef(() => VeraCoreModule),
    TrainingCredentialNftModule,
    TrainingStandardsComplianceModule,
    DomainEventBusModule,
    NotificationsModule,
  ],
  controllers: [
    VerificationController,
    VerificationCoreController,
    VerificationActivityController,
  ],
  providers: [VerificationService, PublicTokenResolver, PrismaService],
  exports: [VerificationService, PublicTokenResolver],
})
export class VerificationModule {}
