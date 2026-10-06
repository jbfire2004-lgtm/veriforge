import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VerificationModule } from '../verification/verification.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { TrainingStandardsComplianceModule } from '../modules/training-standards-compliance/training-standards-compliance.module';
import { TrainingCredentialNftModule } from '../modules/training-credential-nft/training-credential-nft.module';
import { CredentialLedgerModule } from '../modules/credential-ledger/credential-ledger.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrainingVerificationEngine } from './trainingVerification';
import { TrainingVerificationRoutesController } from '../routes/training';

@Module({
  imports: [
    PrismaModule,
    VerificationModule,
    forwardRef(() => VeraCoreModule),
    TrainingStandardsComplianceModule,
    TrainingCredentialNftModule,
    DomainEventBusModule,
    CredentialLedgerModule,
    NotificationsModule,
  ],
  controllers: [TrainingVerificationRoutesController],
  providers: [TrainingVerificationEngine],
  exports: [TrainingVerificationEngine],
})
export class TrainingVerificationModule {}
