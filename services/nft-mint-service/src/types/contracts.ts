export type TrainingCredentialData = {
  workerIdHash: string;
  trainingType: string;
  issuer: string;
  issueDate: number;
  expiryDate: number;
  certificateHash: string;
  veraRecordId: string;
  status: number;
};

export type WorkflowData = {
  workflowId: string;
  workflowType: string;
  issuer: string;
  issueDate: number;
  expiryDate: number;
  workflowHash: string;
  veraRecordId: string;
  status: number;
};

export type EquipmentData = {
  equipmentId: string;
  serialNumber: string;
  equipmentType: string;
  inspectionHistoryHash: string;
  lastInspectionDate: number;
  nextDueDate: number;
  veraRecordId: string;
};

export type MintResult = {
  tokenId: string;
  txHash: string;
};
