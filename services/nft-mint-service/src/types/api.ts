import { z } from "zod";

const unixTsSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const trainingMintSchema = z.object({
  walletAddress: z.string().min(1),
  metadata: z.object({
    workerIdHash: z.string().min(1),
    trainingType: z.string().min(1),
    issuer: z.string().min(1),
    issueDate: unixTsSchema,
    expiryDate: unixTsSchema,
    certificateHash: z.string().min(1),
    veraRecordId: z.string().min(1),
    status: z.number().int().min(0).max(2),
  }),
});

export const workflowMintSchema = z.object({
  walletAddress: z.string().min(1),
  metadata: z.object({
    workflowId: z.string().min(1),
    workflowType: z.string().min(1),
    issuer: z.string().min(1),
    issueDate: unixTsSchema,
    expiryDate: unixTsSchema,
    workflowHash: z.string().min(1),
    veraRecordId: z.string().min(1),
    status: z.number().int().min(0).max(2),
  }),
});

export const equipmentMintSchema = z.object({
  walletAddress: z.string().min(1),
  metadata: z.object({
    equipmentId: z.string().min(1),
    serialNumber: z.string().min(1),
    equipmentType: z.string().min(1),
    inspectionHistoryHash: z.string().min(1),
    lastInspectionDate: unixTsSchema,
    nextDueDate: unixTsSchema,
    veraRecordId: z.string().min(1),
  }),
});

export type TrainingMintPayload = z.infer<typeof trainingMintSchema>;
export type WorkflowMintPayload = z.infer<typeof workflowMintSchema>;
export type EquipmentMintPayload = z.infer<typeof equipmentMintSchema>;
