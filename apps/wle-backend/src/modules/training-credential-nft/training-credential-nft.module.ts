import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BLOCKCHAIN_CREDENTIAL_PROVIDER } from './blockchain-provider.interface';
import { StubBlockchainCredentialProvider } from './stub-blockchain.provider';
import { TrainingCredentialNftController } from './training-credential-nft.controller';
import { TrainingCredentialNftCoordinatorService } from './training-credential-nft-coordinator.service';
import { TrainingCredentialNftEligibilityService } from './training-credential-nft-eligibility.service';
import { TrainingCredentialNftMintingService } from './training-credential-nft-minting.service';
import { TrainingCredentialNftProjectionService } from './training-credential-nft-projection.service';
import { TrainingCredentialNftRegistryService } from './training-credential-nft-registry.service';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingCredentialNftController],
  providers: [
    TrainingCredentialNftRegistryService,
    TrainingCredentialNftEligibilityService,
    TrainingCredentialNftMintingService,
    TrainingCredentialNftCoordinatorService,
    TrainingCredentialNftProjectionService,
    {
      provide: BLOCKCHAIN_CREDENTIAL_PROVIDER,
      useClass: StubBlockchainCredentialProvider,
    },
  ],
  exports: [
    TrainingCredentialNftCoordinatorService,
    TrainingCredentialNftProjectionService,
    TrainingCredentialNftRegistryService,
    BLOCKCHAIN_CREDENTIAL_PROVIDER,
  ],
})
export class TrainingCredentialNftModule {}
