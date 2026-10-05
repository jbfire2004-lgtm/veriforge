export type MintTrainingCredentialInput = {
    trainingRecordId: number;
    workerId: number;
    metadata: Record<string, unknown>;
};
export type MintTrainingCredentialResult = {
    tokenId: string;
    transactionHash: string;
    chain: string;
};
export type VerifyCredentialInput = {
    tokenId: string;
    chain?: string;
    trainingRecordId?: number;
};
export type VerifyCredentialResult = {
    valid: boolean;
    tokenId: string;
    chain: string;
    trainingRecordId: number | null;
    mintedAt: string | null;
    message: string;
};
export interface BlockchainCredentialProvider {
    mintTrainingCredential(input: MintTrainingCredentialInput): Promise<MintTrainingCredentialResult>;
    verifyCredential(input: VerifyCredentialInput): Promise<VerifyCredentialResult>;
}
export declare const BLOCKCHAIN_CREDENTIAL_PROVIDER: unique symbol;
