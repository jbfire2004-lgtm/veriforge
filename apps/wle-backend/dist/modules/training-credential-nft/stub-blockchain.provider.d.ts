import { BlockchainCredentialProvider, MintTrainingCredentialInput, MintTrainingCredentialResult, VerifyCredentialInput, VerifyCredentialResult } from './blockchain-provider.interface';
export declare class StubBlockchainCredentialProvider implements BlockchainCredentialProvider {
    mintTrainingCredential(input: MintTrainingCredentialInput): Promise<MintTrainingCredentialResult>;
    verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult>;
}
