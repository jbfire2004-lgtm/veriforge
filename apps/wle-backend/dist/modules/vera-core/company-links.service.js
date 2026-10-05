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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyLinksService = void 0;
const common_1 = require("@nestjs/common");
const orientation_linking_service_1 = require("../orientation/orientation-linking.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const inactivation_service_1 = require("./inactivation.service");
const crypto_1 = require("crypto");
let CompanyLinksService = class CompanyLinksService {
    constructor(prisma, inactivation, orientationLinking) {
        this.prisma = prisma;
        this.inactivation = inactivation;
        this.orientationLinking = orientationLinking;
    }
    async listByCompany(companyId, activeOnly = true) {
        return this.prisma.companyLink.findMany({
            where: Object.assign({ companyId }, (activeOnly ? { active: true } : {})),
            include: { worker: true },
            orderBy: { startDate: 'desc' },
        });
    }
    async linkWorker(workerId, companyId, opts) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        if ((opts === null || opts === void 0 ? void 0 : opts.deactivateOtherCompanies) !== false) {
            const otherLinks = await this.prisma.companyLink.findMany({
                where: { workerId, active: true, companyId: { not: companyId } },
            });
            for (const link of otherLinks) {
                await this.inactivation.deactivateWorkerAtCompany(workerId, link.companyId, 'NEW_COMPANY_LINK');
            }
        }
        const existing = await this.prisma.companyLink.findFirst({
            where: { workerId, companyId, active: true },
        });
        if (existing)
            return existing;
        const link = await this.prisma.companyLink.create({
            data: {
                workerId,
                companyId,
                active: true,
                role: opts === null || opts === void 0 ? void 0 : opts.role,
                trade: opts === null || opts === void 0 ? void 0 : opts.trade,
            },
            include: { worker: true, company: true },
        });
        await this.prisma.worker.update({
            where: { id: workerId },
            data: { companyId },
        });
        if (!worker.qrToken) {
            await this.prisma.worker.update({
                where: { id: workerId },
                data: { qrToken: `w-${(0, crypto_1.randomBytes)(8).toString('hex')}` },
            });
        }
        if (this.orientationLinking) {
            void this.orientationLinking.onCompanyLinkCreated(workerId, companyId);
        }
        return link;
    }
    async linkByQrToken(qrToken, companyId, assignedBy) {
        const worker = await this.prisma.worker.findFirst({
            where: {
                qrToken,
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found for QR');
        return this.linkWorker(worker.id, companyId);
    }
    async endAssignment(workerId, companyId) {
        return this.inactivation.deactivateWorkerAtCompany(workerId, companyId, 'END_ASSIGNMENT');
    }
    async activate(workerId, companyId) {
        const link = await this.prisma.companyLink.findFirst({
            where: { workerId, companyId },
            orderBy: { startDate: 'desc' },
        });
        if (!link) {
            return this.linkWorker(workerId, companyId);
        }
        return this.prisma.companyLink.update({
            where: { id: link.id },
            data: { active: true, endDate: null, startDate: new Date() },
            include: { worker: true, company: true },
        });
    }
};
exports.CompanyLinksService = CompanyLinksService;
exports.CompanyLinksService = CompanyLinksService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService,
        orientation_linking_service_1.OrientationLinkingService])
], CompanyLinksService);
//# sourceMappingURL=company-links.service.js.map