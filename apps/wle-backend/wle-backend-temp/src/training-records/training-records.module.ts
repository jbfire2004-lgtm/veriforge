import { Module, forwardRef } from '@nestjs/common';
import { TrainingRecordsController } from './training-records.controller';
import { TrainingRecordsService } from './training-records.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiPlatformModule } from '../modules/api-platform/api-platform.module';
import { CredentialLedgerModule } from '../modules/credential-ledger/credential-ledger.module';

@Module({
  imports: [
    PrismaModule,
    CredentialLedgerModule,
    forwardRef(() => ApiPlatformModule),
  ],
  controllers: [TrainingRecordsController],
  providers: [TrainingRecordsService],
  exports: [TrainingRecordsService],
})
export class TrainingRecordsModule {}
