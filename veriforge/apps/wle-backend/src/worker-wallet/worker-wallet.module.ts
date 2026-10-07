import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QrModule } from '../qr/qr.module';
import { VeraCoreModule } from '../modules/vera-core/vera-core.module';
import { TrainingCredentialNftModule } from '../modules/training-credential-nft/training-credential-nft.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { WorkerWalletController } from './worker-wallet.controller';
import { WorkerWalletService } from './worker-wallet.service';

@Module({
  imports: [
    PrismaModule,
    QrModule,
    forwardRef(() => VeraCoreModule),
    TrainingCredentialNftModule,
    DomainEventBusModule,
  ],
  controllers: [WorkerWalletController],
  providers: [WorkerWalletService],
  exports: [WorkerWalletService],
})
export class WorkerWalletModule {}
