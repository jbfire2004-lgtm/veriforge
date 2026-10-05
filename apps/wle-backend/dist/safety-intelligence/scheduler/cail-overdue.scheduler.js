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
var CailOverdueScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CailOverdueScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_types_1 = require("../../notifications/notification-types");
let CailOverdueScheduler = CailOverdueScheduler_1 = class CailOverdueScheduler {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(CailOverdueScheduler_1.name);
        this.runningOverdue = false;
        this.runningDueSoon = false;
    }
    async markOverdueEntries() {
        if (this.runningOverdue)
            return;
        this.runningOverdue = true;
        try {
            const now = new Date();
            const toMark = await this.prisma.cailEntry.findMany({
                where: {
                    status: { in: [client_1.CailStatus.open, client_1.CailStatus.in_progress] },
                    dueDate: { lt: now },
                },
                select: {
                    id: true,
                    title: true,
                    assignedUserId: true,
                    ownerCompanyId: true,
                    projectId: true,
                    dueDate: true,
                },
                take: 500,
            });
            if (!toMark.length)
                return;
            await this.prisma.cailEntry.updateMany({
                where: { id: { in: toMark.map((e) => e.id) } },
                data: {
                    status: client_1.CailStatus.overdue,
                    overdueAt: now,
                },
            });
            this.logger.log(`Marked ${toMark.length} CAIL entries as overdue`);
            await this.notifyOverdue(toMark, now);
        }
        catch (e) {
            this.logger.error(`CAIL overdue job failed: ${e}`);
        }
        finally {
            this.runningOverdue = false;
        }
    }
    async notifyDueSoonEntries() {
        var _a;
        if (this.runningDueSoon)
            return;
        this.runningDueSoon = true;
        try {
            const now = new Date();
            const until = new Date(now);
            until.setDate(until.getDate() + 3);
            const dayKey = now.toISOString().slice(0, 10);
            const entries = await this.prisma.cailEntry.findMany({
                where: {
                    status: { in: [client_1.CailStatus.open, client_1.CailStatus.in_progress] },
                    dueDate: { gte: now, lte: until },
                },
                select: {
                    id: true,
                    title: true,
                    assignedUserId: true,
                    ownerCompanyId: true,
                    dueDate: true,
                },
                take: 500,
            });
            for (const entry of entries) {
                const dueLabel = entry.dueDate
                    ? entry.dueDate.toLocaleDateString()
                    : 'soon';
                const body = `"${entry.title}" is due ${dueLabel}.`;
                if (entry.assignedUserId) {
                    await this.notifications.notifyUsers({
                        userIds: [entry.assignedUserId],
                        type: notification_types_1.NOTIFICATION_TYPES.CAIL_DUE_SOON,
                        title: 'CAIL due soon',
                        body,
                        dedupeKey: `cail-due-soon:${entry.id}:${dayKey}`,
                        payload: {
                            cailId: entry.id,
                            dueDate: (_a = entry.dueDate) === null || _a === void 0 ? void 0 : _a.toISOString(),
                        },
                        companyId: entry.ownerCompanyId,
                    });
                }
                await this.notifications.notifyCompanySupervisors(entry.ownerCompanyId, {
                    type: notification_types_1.NOTIFICATION_TYPES.CAIL_DUE_SOON,
                    title: 'CAIL due soon (team)',
                    body,
                    dedupeKey: `cail-due-soon-super:${entry.id}:${dayKey}`,
                    payload: { cailId: entry.id },
                    companyId: entry.ownerCompanyId,
                });
            }
        }
        catch (e) {
            this.logger.error(`CAIL due-soon job failed: ${e}`);
        }
        finally {
            this.runningDueSoon = false;
        }
    }
    async notifyOverdue(entries, now) {
        var _a;
        const dayKey = now.toISOString().slice(0, 10);
        for (const entry of entries) {
            const body = `"${entry.title}" is past due.`;
            if (entry.assignedUserId) {
                await this.notifications.notifyUsers({
                    userIds: [entry.assignedUserId],
                    type: notification_types_1.NOTIFICATION_TYPES.CAIL_OVERDUE,
                    title: 'CAIL overdue',
                    body,
                    dedupeKey: `cail-overdue:${entry.id}:${dayKey}`,
                    payload: { cailId: entry.id, dueDate: (_a = entry.dueDate) === null || _a === void 0 ? void 0 : _a.toISOString() },
                    companyId: entry.ownerCompanyId,
                });
            }
            await this.notifications.notifyCompanySupervisors(entry.ownerCompanyId, {
                type: notification_types_1.NOTIFICATION_TYPES.CAIL_OVERDUE,
                title: 'CAIL overdue (team)',
                body,
                dedupeKey: `cail-overdue-super:${entry.id}:${dayKey}`,
                payload: { cailId: entry.id },
                companyId: entry.ownerCompanyId,
            });
        }
    }
};
exports.CailOverdueScheduler = CailOverdueScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CailOverdueScheduler.prototype, "markOverdueEntries", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CailOverdueScheduler.prototype, "notifyDueSoonEntries", null);
exports.CailOverdueScheduler = CailOverdueScheduler = CailOverdueScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CailOverdueScheduler);
//# sourceMappingURL=cail-overdue.scheduler.js.map