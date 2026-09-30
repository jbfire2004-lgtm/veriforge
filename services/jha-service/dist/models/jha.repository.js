"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jhaRepository = void 0;
const prisma_1 = require("../db/prisma");
const jhaInclude = {
    hazards: true,
    controls: true,
    signatures: true,
};
exports.jhaRepository = {
    createJha(data) {
        return prisma_1.prisma.jha.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                createdBy: data.createdBy,
            },
            include: jhaInclude,
        });
    },
    findJha(id, companyId) {
        return prisma_1.prisma.jha.findFirst({
            where: { id, companyId },
            include: jhaInclude,
        });
    },
    updateJha(id, companyId, data) {
        return prisma_1.prisma.jha.updateMany({
            where: { id, companyId },
            data,
        });
    },
    addHazard(data) {
        return prisma_1.prisma.jhaHazard.create({ data });
    },
    addControl(data) {
        return prisma_1.prisma.jhaControl.create({ data });
    },
    addSignature(data) {
        return prisma_1.prisma.jhaSignature.create({
            data: {
                jhaId: data.jhaId,
                workerId: data.workerId,
                signatureBlob: data.signatureBlob,
                signedAt: data.signedAt ?? new Date(),
            },
        });
    },
    createVersion(data) {
        return prisma_1.prisma.jhaVersion.create({ data });
    },
    findVersion(jhaId, version) {
        return prisma_1.prisma.jhaVersion.findUnique({
            where: { jhaId_version: { jhaId, version } },
        });
    },
    findOfflineSync(deviceId, clientSyncId) {
        return prisma_1.prisma.jhaOfflineSync.findUnique({
            where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.jhaOfflineSync.upsert({
            where: {
                deviceId_clientSyncId: {
                    deviceId: data.deviceId,
                    clientSyncId: data.clientSyncId,
                },
            },
            create: {
                companyId: data.companyId,
                deviceId: data.deviceId,
                clientSyncId: data.clientSyncId,
                action: data.action,
                payload: data.payload,
                status: data.status,
                result: data.result,
                syncedAt: data.status === 'synced' ? new Date() : undefined,
            },
            update: {
                status: data.status,
                result: data.result,
                syncedAt: data.status === 'synced' ? new Date() : undefined,
            },
        });
    },
    reloadJha(id, companyId) {
        return this.findJha(id, companyId);
    },
};
