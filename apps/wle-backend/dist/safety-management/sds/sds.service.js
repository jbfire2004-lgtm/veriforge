"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SdsService = class SdsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listDocuments(companyId, search) {
        return this.prisma.sdsDocument.findMany({
            where: Object.assign({ companyId }, (search
                ? { productName: { contains: search, mode: 'insensitive' } }
                : {})),
            orderBy: { productName: 'asc' },
            take: 200,
        });
    }
    async createDocument(data) {
        var _a, _b;
        return this.prisma.sdsDocument.create({
            data: {
                companyId: data.companyId,
                productName: data.productName,
                manufacturer: data.manufacturer,
                casNumbers: ((_a = data.casNumbers) !== null && _a !== void 0 ? _a : []),
                hazardClasses: ((_b = data.hazardClasses) !== null && _b !== void 0 ? _b : []),
                storageKey: data.storageKey,
                revisionDate: data.revisionDate,
                expiresAt: data.expiresAt,
            },
        });
    }
    async getDocument(id) {
        const doc = await this.prisma.sdsDocument.findUnique({
            where: { id },
            include: {
                inventory: { include: { site: { select: { id: true, name: true } } } },
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('SDS document not found');
        return doc;
    }
    async addInventoryItem(data) {
        let missingSdsFlag = !data.sdsDocumentId;
        if (data.sdsDocumentId) {
            const sds = await this.prisma.sdsDocument.findUnique({
                where: { id: data.sdsDocumentId },
            });
            if (!sds || sds.status !== 'published')
                missingSdsFlag = true;
        }
        return this.prisma.chemicalInventoryItem.create({
            data: {
                companyId: data.companyId,
                siteId: data.siteId,
                projectId: data.projectId,
                sdsDocumentId: data.sdsDocumentId,
                productName: data.productName,
                quantity: data.quantity,
                unit: data.unit,
                locationNote: data.locationNote,
                containerSize: data.containerSize,
                storageClass: data.storageClass,
                chemicalExpiry: data.chemicalExpiry,
                missingSdsFlag,
            },
        });
    }
    async listPolicies(companyId) {
        return this.prisma.policyDocument.findMany({
            where: { companyId },
            orderBy: { publishedAt: 'desc' },
            take: 100,
        });
    }
    async createPolicy(data) {
        return this.prisma.policyDocument.create({ data });
    }
    async acknowledgePolicy(data) {
        return this.prisma.policyAcknowledgment.upsert({
            where: {
                policyDocumentId_workerId: {
                    policyDocumentId: data.policyDocumentId,
                    workerId: data.workerId,
                },
            },
            create: data,
            update: {
                acknowledgedAt: new Date(),
                signatureData: data.signatureData,
            },
        });
    }
};
exports.SdsService = SdsService;
exports.SdsService = SdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SdsService);
//# sourceMappingURL=sds.service.js.map