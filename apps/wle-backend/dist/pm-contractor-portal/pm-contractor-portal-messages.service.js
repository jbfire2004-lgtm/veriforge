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
exports.PmContractorPortalMessagesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
const contractor_portal_notification_templates_1 = require("./contractor-portal-notification.templates");
let PmContractorPortalMessagesService = class PmContractorPortalMessagesService {
    constructor(prisma, access, notifications) {
        this.prisma = prisma;
        this.access = access;
        this.notifications = notifications;
    }
    async listThreads(actor, opts) {
        if (this.access.isContractorRole(actor.role)) {
            const contractorCompanyId = this.access.requireContractorCompany(actor);
            const where = Object.assign(Object.assign({ contractorCompanyId }, ((opts === null || opts === void 0 ? void 0 : opts.primeCompanyId)
                ? { primeCompanyId: opts.primeCompanyId }
                : {})), ((opts === null || opts === void 0 ? void 0 : opts.projectId) ? { projectId: opts.projectId } : {}));
            const messages = await this.prisma.pmContractorPortalMessage.findMany({
                where,
                include: {
                    sender: { select: { id: true, username: true, role: true } },
                    primeCompany: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
            return { messages };
        }
        if (!pm_contractor_portal_access_service_1.PRIME_PORTAL_ROLES.includes(actor.role) || !actor.companyId) {
            throw new common_1.ForbiddenException('Insufficient permissions for messaging');
        }
        const messages = await this.prisma.pmContractorPortalMessage.findMany({
            where: Object.assign({ primeCompanyId: actor.companyId }, ((opts === null || opts === void 0 ? void 0 : opts.primeCompanyId)
                ? { contractorCompanyId: opts.primeCompanyId }
                : {})),
            include: {
                sender: { select: { id: true, username: true, role: true } },
                contractorCompany: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return { messages };
    }
    async sendMessage(actor, body) {
        const isContractor = pm_contractor_portal_access_service_1.CONTRACTOR_ROLES.includes(actor.role);
        const isPrime = pm_contractor_portal_access_service_1.PRIME_PORTAL_ROLES.includes(actor.role);
        if (!isContractor && !isPrime) {
            throw new common_1.ForbiddenException('Cannot send portal messages');
        }
        if (isContractor) {
            const contractorCompanyId = this.access.requireContractorCompany(actor);
            if (body.contractorCompanyId !== contractorCompanyId) {
                throw new common_1.ForbiddenException('Invalid contractor company');
            }
        }
        else if (!actor.companyId || body.primeCompanyId !== actor.companyId) {
            throw new common_1.ForbiddenException('Invalid prime company');
        }
        await this.access.assertMembership(body.primeCompanyId, body.contractorCompanyId, body.projectId);
        const message = await this.prisma.pmContractorPortalMessage.create({
            data: {
                primeCompanyId: body.primeCompanyId,
                contractorCompanyId: body.contractorCompanyId,
                projectId: body.projectId,
                senderUserId: actor.userId,
                body: body.text,
                relatedType: body.relatedType,
                relatedId: body.relatedId,
            },
            include: {
                sender: { select: { id: true, username: true } },
                primeCompany: { select: { id: true, name: true } },
            },
        });
        await this.notifyRecipients(actor, message.primeCompany.name, message.id, body);
        return message;
    }
    async markRead(actor, messageId) {
        const message = await this.prisma.pmContractorPortalMessage.findUnique({
            where: { id: messageId },
        });
        if (!message)
            return null;
        if (this.access.isContractorRole(actor.role)) {
            this.access.requireContractorCompany(actor);
            if (message.contractorCompanyId !== actor.companyId) {
                throw new common_1.ForbiddenException('Cannot read this message');
            }
        }
        else if (!actor.companyId || message.primeCompanyId !== actor.companyId) {
            throw new common_1.ForbiddenException('Cannot read this message');
        }
        return this.prisma.pmContractorPortalMessage.update({
            where: { id: messageId },
            data: { readAt: new Date() },
        });
    }
    async notifyRecipients(actor, primeName, messageId, body) {
        if (!this.notifications)
            return;
        const isContractor = pm_contractor_portal_access_service_1.CONTRACTOR_ROLES.includes(actor.role);
        const template = (0, contractor_portal_notification_templates_1.contractorPortalMessageReceived)({
            primeName,
            preview: body.text,
            messageId,
            primeCompanyId: body.primeCompanyId,
        });
        const userIds = isContractor
            ? await this.primeRecipientIds(body.primeCompanyId)
            : await this.contractorRecipientIds(body.contractorCompanyId);
        if (!userIds.length)
            return;
        await this.notifications.notifyUsers({
            userIds,
            type: template.type,
            title: template.title,
            body: template.body,
            payload: template.metadata,
        });
    }
    async contractorRecipientIds(companyId) {
        const users = await this.prisma.user.findMany({
            where: {
                companyId,
                role: {
                    in: [
                        client_1.UserRole.CONTRACTOR_ADMIN,
                        client_1.UserRole.CONTRACTOR_USER,
                        client_1.UserRole.COMPANY_ADMIN,
                    ],
                },
            },
            select: { id: true },
            take: 25,
        });
        return users.map((u) => u.id);
    }
    async primeRecipientIds(companyId) {
        const users = await this.prisma.user.findMany({
            where: {
                companyId,
                role: { in: pm_contractor_portal_access_service_1.PRIME_PORTAL_ROLES },
            },
            select: { id: true },
            take: 25,
        });
        return users.map((u) => u.id);
    }
};
exports.PmContractorPortalMessagesService = PmContractorPortalMessagesService;
exports.PmContractorPortalMessagesService = PmContractorPortalMessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_contractor_portal_access_service_1.PmContractorPortalAccessService,
        notifications_service_1.NotificationsService])
], PmContractorPortalMessagesService);
//# sourceMappingURL=pm-contractor-portal-messages.service.js.map