import { createHash, randomUUID } from 'crypto';
import {
  BlockchainCredentialProvider,
  MintTrainingCredentialInput,
  MintTrainingCredentialResult,
  VerifyCredentialInput,
  VerifyCredentialResult,
} from './blockchain-provider.interface';
import { nftStubChainId } from './training-credential-nft.config';

/** Swappable stub — replace with Polygon/EVM provider in production. */
export class StubBlockchainCredentialProvider
  implements BlockchainCredentialProvider
{
  async mintTrainingCredential(
    input: MintTrainingCredentialInput,
  ): Promise<MintTrainingCredentialResult> {
    const digest = createHash('sha256')
      .update(JSON.stringify(input.metadata))
      .digest('hex')
      .slice(0, 16);
    return {
      chain: nftStubChainId(),
      tokenId: `vera-tr-${input.trainingRecordId}-${digest}`,
      transactionHash: `0xstub-${randomUUID().replace(/-/g, '')}`,
    };
  }

  async verifyCredential(
    input: VerifyCredentialInput,
  ): Promise<VerifyCredentialResult> {
    const match = /^vera-tr-(\d+)-/.exec(input.tokenId);
    const trainingRecordId =
      input.trainingRecordId ?? (match ? Number(match[1]) : null);
    return {
      valid: Boolean(trainingRecordId && input.tokenId.startsWith('vera-tr-')),
      tokenId: input.tokenId,
      chain: input.chain ?? nftStubChainId(),
      trainingRecordId,
      mintedAt: new Date().toISOString(),
      message: trainingRecordId
        ? 'Stub chain: credential token matches Vera training record format.'
        : 'Token format not recognized on stub chain.',
    };
  }
}
