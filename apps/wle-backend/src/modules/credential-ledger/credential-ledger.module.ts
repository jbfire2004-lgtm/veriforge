import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CredentialLedgerService } from './credential-ledger.service';
import { CredentialLedgerChainService } from './credential-ledger-chain.service';
import { CredentialLedgerBackfillService } from './credential-ledger-backfill.service';
import { CredentialLedgerController } from './credential-ledger.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CredentialLedgerController],
  providers: [
    CredentialLedgerService,
    CredentialLedgerChainService,
    CredentialLedgerBackfillService,
  ],
  exports: [
    CredentialLedgerService,
    CredentialLedgerChainService,
    CredentialLedgerBackfillService,
  ],
})
export class CredentialLedgerModule {}
