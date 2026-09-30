import { Prisma, TrainingJobStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

const jobInclude = {
  datasetReferences: true,
  artifacts: true,
};

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const trainingRepository = {
  create(data: {
    companyId: string;
    name: string;
    modelType: string;
    config?: unknown;
    createdBy: string;
    status?: TrainingJobStatus;
  }) {
    return prisma.trainingJob.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        modelType: data.modelType,
        config: json(data.config ?? {}),
        createdBy: data.createdBy,
        status: data.status,
      },
      include: jobInclude,
    });
  },

  findById(id: string, companyId: string) {
    return prisma.trainingJob.findFirst({
      where: { id, companyId },
      include: jobInclude,
    });
  },

  list(companyId: string, status?: TrainingJobStatus) {
    return prisma.trainingJob.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      include: jobInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus(
    id: string,
    companyId: string,
    data: {
      status: TrainingJobStatus;
      errorMessage?: string | null;
      startedAt?: Date | null;
      completedAt?: Date | null;
    },
  ) {
    return prisma.trainingJob.updateMany({
      where: { id, companyId },
      data,
    });
  },

  update(
    id: string,
    companyId: string,
    data: Partial<{ name: string; modelType: string; config: unknown }>,
  ) {
    const { config, ...rest } = data;
    return prisma.trainingJob.updateMany({
      where: { id, companyId },
      data: {
        ...rest,
        ...(config !== undefined ? { config: json(config) } : {}),
      },
    });
  },

  delete(id: string, companyId: string) {
    return prisma.trainingJob.deleteMany({ where: { id, companyId } });
  },

  addDatasetReference(data: {
    companyId: string;
    trainingJobId: string;
    datasetId: string;
    datasetVersion?: string;
    sourceType: string;
    metadata?: unknown;
  }) {
    return prisma.datasetReference.create({
      data: {
        companyId: data.companyId,
        trainingJobId: data.trainingJobId,
        datasetId: data.datasetId,
        datasetVersion: data.datasetVersion,
        sourceType: data.sourceType,
        metadata: json(data.metadata ?? {}),
      },
    });
  },

  addArtifact(data: {
    companyId: string;
    trainingJobId: string;
    artifactUri: string;
    artifactType: string;
    checksum?: string;
    sizeBytes?: bigint;
    metadata?: unknown;
  }) {
    return prisma.modelArtifact.create({
      data: {
        companyId: data.companyId,
        trainingJobId: data.trainingJobId,
        artifactUri: data.artifactUri,
        artifactType: data.artifactType,
        checksum: data.checksum,
        sizeBytes: data.sizeBytes,
        metadata: json(data.metadata ?? {}),
      },
    });
  },

  logIngestionEvent(data: {
    companyId: string;
    eventType: string;
    payload: unknown;
    trainingJobId?: string;
  }) {
    return prisma.ingestionEventLog.create({
      data: {
        companyId: data.companyId,
        eventType: data.eventType,
        payload: json(data.payload),
        trainingJobId: data.trainingJobId,
      },
    });
  },
};
