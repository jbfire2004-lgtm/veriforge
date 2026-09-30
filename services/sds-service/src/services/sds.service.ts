import {
  hazardExtractionEngine,
  controlExtractionEngine,
  expiryEngine,
  zoneEnforcementEngine,
} from '../engines/sds.engine';
import { sdsRepository } from '../models/sds.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { WorkerSdsSummary } from '../types';
import { logger } from '../utils/logger';

function mapDocument(doc: Awaited<ReturnType<typeof sdsRepository.findDocument>>) {
  if (!doc) return null;
  const now = new Date();
  const expired = expiryEngine.isExpired(doc.expiryDate, now);
  const expiringSoon = expiryEngine.isExpiringSoon(doc.expiryDate, now);

  return {
    id: doc.id,
    companyId: doc.companyId,
    productName: doc.productName,
    manufacturer: doc.manufacturer,
    casNumber: doc.casNumber,
    whmisClassification: doc.whmisClassification,
    ppeRequirements: doc.ppeRequirements,
    firstAid: doc.firstAid,
    handlingStorage: doc.handlingStorage,
    extractedHazards: doc.extractedHazards,
    extractedControls: doc.extractedControls,
    expiryDate: doc.expiryDate?.toISOString() ?? null,
    version: doc.version,
    filePath: doc.filePath,
    expired,
    expiringSoon,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const sdsService = {
  async createDocument(input: {
    companyId: string;
    productName: string;
    manufacturer?: string;
    casNumber?: string;
    whmisClassification?: string;
    ppeRequirements?: unknown;
    firstAid?: unknown;
    handlingStorage?: unknown;
    expiryDate?: string;
    version?: number;
    filePath?: string;
    zoneId?: string;
    requiredForZone?: boolean;
  }) {
    const extractedHazards = hazardExtractionEngine.extract({
      whmisClassification: input.whmisClassification,
      handlingStorage: input.handlingStorage,
      firstAid: input.firstAid,
      casNumber: input.casNumber,
    });

    const extractedControls = controlExtractionEngine.extract({
      ppeRequirements: input.ppeRequirements,
      handlingStorage: input.handlingStorage,
    });

    const doc = await sdsRepository.createDocument({
      companyId: input.companyId,
      productName: input.productName,
      manufacturer: input.manufacturer,
      casNumber: input.casNumber,
      whmisClassification: input.whmisClassification,
      ppeRequirements: input.ppeRequirements,
      firstAid: input.firstAid,
      handlingStorage: input.handlingStorage,
      extractedHazards,
      extractedControls,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      version: input.version,
      filePath: input.filePath,
    });

    if (input.zoneId && input.requiredForZone) {
      const rule = await sdsRepository.findZoneRule(input.companyId, input.zoneId);
      const existing = (rule?.requiredSdsIds as string[]) ?? [];
      if (!existing.includes(doc.id)) {
        await sdsRepository.upsertZoneRule(input.companyId, input.zoneId, [...existing, doc.id]);
      }
    }

    logger.info('sds document created', { sdsId: doc.id, companyId: input.companyId });
    return mapDocument(doc);
  },

  async getDocument(id: string, companyId: string) {
    const doc = await sdsRepository.findDocument(id, companyId);
    if (!doc) throw new NotFoundError('SDS document not found');
    return mapDocument(doc);
  },

  async acknowledge(input: {
    companyId: string;
    sdsId: string;
    workerId: string;
  }) {
    const doc = await sdsRepository.findDocument(input.sdsId, input.companyId);
    if (!doc) throw new NotFoundError('SDS document not found');

    if (expiryEngine.isExpired(doc.expiryDate)) {
      throw new BadRequestError('Cannot acknowledge expired SDS document');
    }

    const ack = await sdsRepository.upsertAcknowledgment(input.sdsId, input.workerId);

    return {
      id: ack.id,
      sdsId: ack.sdsId,
      workerId: ack.workerId,
      acknowledgedAt: ack.acknowledgedAt.toISOString(),
      productName: doc.productName,
    };
  },

  async getWorkerSds(
    workerId: string,
    companyId: string,
    zoneId?: string,
  ): Promise<WorkerSdsSummary> {
    const acknowledgments = await sdsRepository.listWorkerAcknowledgments(workerId, companyId);
    const acknowledgedIds = new Set(acknowledgments.map((a) => a.sdsId));

    let requiredSdsIds: string[] = [];
    if (zoneId) {
      const rule = await sdsRepository.findZoneRule(companyId, zoneId);
      requiredSdsIds = (rule?.requiredSdsIds as string[]) ?? [];
    } else {
      requiredSdsIds = acknowledgments.map((a) => a.sdsId);
    }

    const docs =
      requiredSdsIds.length > 0
        ? await sdsRepository.listDocumentsByIds(requiredSdsIds, companyId)
        : await sdsRepository.listCompanyDocuments(companyId);

    const now = new Date();
    const expiredSdsIds = new Set(
      docs.filter((d) => expiryEngine.isExpired(d.expiryDate, now)).map((d) => d.id),
    );
    const expiringSoonSds = docs
      .filter((d) => expiryEngine.isExpiringSoon(d.expiryDate, now))
      .map((d) => d.id);

    const enforcement = zoneEnforcementEngine.evaluate({
      requiredSdsIds: zoneId ? requiredSdsIds : [],
      acknowledgedSdsIds: acknowledgedIds,
      expiredSdsIds,
    });

    const documents = docs.map((d) => ({
      id: d.id,
      productName: d.productName,
      acknowledged: acknowledgedIds.has(d.id),
      expired: expiredSdsIds.has(d.id),
      expiringSoon: expiringSoonSds.includes(d.id),
      expiryDate: d.expiryDate?.toISOString() ?? null,
    }));

    return {
      workerId,
      companyId,
      zoneId,
      totalRequired: zoneId ? requiredSdsIds.length : documents.length,
      acknowledgedCount: documents.filter((d) => d.acknowledged).length,
      compliant: zoneId ? enforcement.compliant : true,
      missingSds: enforcement.missingSds,
      expiredSds: [...expiredSdsIds].filter((id) =>
        zoneId ? requiredSdsIds.includes(id) : true,
      ),
      expiringSoonSds,
      documents,
    };
  },
};
