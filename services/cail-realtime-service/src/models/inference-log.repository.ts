import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const inferenceLogRepository = {
  create(data: {
    companyId: string;
    modelId: string;
    version: number;
    engineLayer: string;
    inputData: unknown;
    outputData: unknown;
    latencyMs: number;
  }) {
    return prisma.cailInferenceLog.create({
      data: {
        companyId: data.companyId,
        modelId: data.modelId,
        version: data.version,
        engineLayer: data.engineLayer,
        inputData: json(data.inputData),
        outputData: json(data.outputData),
        latencyMs: data.latencyMs,
      },
    });
  },
};
