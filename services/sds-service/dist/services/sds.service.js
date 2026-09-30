"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdsService = void 0;
const sds_engine_1 = require("../engines/sds.engine");
const sds_repository_1 = require("../models/sds.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapDocument(doc) {
    if (!doc)
        return null;
    const now = new Date();
    const expired = sds_engine_1.expiryEngine.isExpired(doc.expiryDate, now);
    const expiringSoon = sds_engine_1.expiryEngine.isExpiringSoon(doc.expiryDate, now);
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
exports.sdsService = {
    async createDocument(input) {
        const extractedHazards = sds_engine_1.hazardExtractionEngine.extract({
            whmisClassification: input.whmisClassification,
            handlingStorage: input.handlingStorage,
            firstAid: input.firstAid,
            casNumber: input.casNumber,
        });
        const extractedControls = sds_engine_1.controlExtractionEngine.extract({
            ppeRequirements: input.ppeRequirements,
            handlingStorage: input.handlingStorage,
        });
        const doc = await sds_repository_1.sdsRepository.createDocument({
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
            const rule = await sds_repository_1.sdsRepository.findZoneRule(input.companyId, input.zoneId);
            const existing = rule?.requiredSdsIds ?? [];
            if (!existing.includes(doc.id)) {
                await sds_repository_1.sdsRepository.upsertZoneRule(input.companyId, input.zoneId, [...existing, doc.id]);
            }
        }
        logger_1.logger.info('sds document created', { sdsId: doc.id, companyId: input.companyId });
        return mapDocument(doc);
    },
    async getDocument(id, companyId) {
        const doc = await sds_repository_1.sdsRepository.findDocument(id, companyId);
        if (!doc)
            throw new errors_1.NotFoundError('SDS document not found');
        return mapDocument(doc);
    },
    async acknowledge(input) {
        const doc = await sds_repository_1.sdsRepository.findDocument(input.sdsId, input.companyId);
        if (!doc)
            throw new errors_1.NotFoundError('SDS document not found');
        if (sds_engine_1.expiryEngine.isExpired(doc.expiryDate)) {
            throw new errors_1.BadRequestError('Cannot acknowledge expired SDS document');
        }
        const ack = await sds_repository_1.sdsRepository.upsertAcknowledgment(input.sdsId, input.workerId);
        return {
            id: ack.id,
            sdsId: ack.sdsId,
            workerId: ack.workerId,
            acknowledgedAt: ack.acknowledgedAt.toISOString(),
            productName: doc.productName,
        };
    },
    async getWorkerSds(workerId, companyId, zoneId) {
        const acknowledgments = await sds_repository_1.sdsRepository.listWorkerAcknowledgments(workerId, companyId);
        const acknowledgedIds = new Set(acknowledgments.map((a) => a.sdsId));
        let requiredSdsIds = [];
        if (zoneId) {
            const rule = await sds_repository_1.sdsRepository.findZoneRule(companyId, zoneId);
            requiredSdsIds = rule?.requiredSdsIds ?? [];
        }
        else {
            requiredSdsIds = acknowledgments.map((a) => a.sdsId);
        }
        const docs = requiredSdsIds.length > 0
            ? await sds_repository_1.sdsRepository.listDocumentsByIds(requiredSdsIds, companyId)
            : await sds_repository_1.sdsRepository.listCompanyDocuments(companyId);
        const now = new Date();
        const expiredSdsIds = new Set(docs.filter((d) => sds_engine_1.expiryEngine.isExpired(d.expiryDate, now)).map((d) => d.id));
        const expiringSoonSds = docs
            .filter((d) => sds_engine_1.expiryEngine.isExpiringSoon(d.expiryDate, now))
            .map((d) => d.id);
        const enforcement = sds_engine_1.zoneEnforcementEngine.evaluate({
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
            expiredSds: [...expiredSdsIds].filter((id) => zoneId ? requiredSdsIds.includes(id) : true),
            expiringSoonSds,
            documents,
        };
    },
};
