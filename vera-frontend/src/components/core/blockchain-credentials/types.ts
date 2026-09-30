export type CredentialStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | string;

export type BlockchainCredential = {
  id?: string | number;
  tokenId?: string | number;
  type: string;
  status: CredentialStatus;
  explorerUrl: string;
  issueDate?: string | number | null;
  expiryDate?: string | number | null;
  lastInspectionDate?: string | number | null;
  nextDueDate?: string | number | null;
};

export type WorkerCredentialsResponse = {
  trainingCredentials: BlockchainCredential[];
  workflowCredentials: BlockchainCredential[];
  equipmentCredentials: BlockchainCredential[];
};
