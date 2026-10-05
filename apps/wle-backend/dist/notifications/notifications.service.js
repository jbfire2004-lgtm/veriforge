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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./channels/email.service");
const sms_service_1 = require("./channels/sms.service");
const push_service_1 = require("./channels/push.service");
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
];
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, email, sms, push) {
        this.prisma = prisma;
        this.email = email;
        this.sms = sms;
        this.push = push;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async getOrCreatePreferences(userId) {
        var _a, _b;
        const existing = await this.prisma.userNotificationPreference.findUnique({
            where: { userId },
        });
        if (existing)
            return existing;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, worker: { select: { phone: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.userNotificationPreference.create({
            data: {
                userId,
                phone: (_b = (_a = user.worker) === null || _a === void 0 ? void 0 : _a.phone) !== null && _b !== void 0 ? _b : null,
            },
        });
    }
    async updatePreferences(userId, dto) {
        await this.getOrCreatePreferences(userId);
        return this.prisma.userNotificationPreference.update({
            where: { userId },
            data: dto,
        });
    }
    async listForUser(userId, opts) {
        var _a;
        return this.prisma.notification.findMany({
            where: Object.assign({ userId }, ((opts === null || opts === void 0 ? void 0 : opts.unreadOnly) ? { readAt: null } : {})),
            orderBy: { createdAt: 'desc' },
            take: (_a = opts === null || opts === void 0 ? void 0 : opts.take) !== null && _a !== void 0 ? _a : 100,
        });
    }
    async unreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, readAt: null, channel: client_1.NotificationChannel.IN_APP },
        });
    }
    async markRead(userId, notificationId) {
        const row = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!row)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { readAt: new Date(), status: client_1.NotificationStatus.READ },
        });
    }
    async markAllRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date(), status: client_1.NotificationStatus.READ },
        });
        return { updated: result.count };
    }
    async notifyCompanySupervisors(companyId, input) {
        const users = await this.prisma.user.findMany({
            where: { companyId, role: { in: SUPERVISOR_ROLES } },
            select: { id: true },
            take: 50,
        });
        return this.notifyUsers(Object.assign(Object.assign({}, input), { userIds: users.map((u) => u.id) }));
    }
    async notifyUsers(input) {
        var _a, _b;
        let created = 0;
        let skipped = 0;
        for (const userId of input.userIds) {
            const prefs = await this.getOrCreatePreferences(userId);
            if (!this.isTypeEnabled(input.type, prefs)) {
                skipped++;
                continue;
            }
            if (this.inQuietHours(prefs)) {
                skipped++;
                continue;
            }
            const perUserDedupe = input.dedupeKey
                ? `${input.dedupeKey}:u${userId}`
                : undefined;
            if (perUserDedupe) {
                const exists = await this.prisma.notification.findFirst({
                    where: { dedupeKey: perUserDedupe },
                });
                if (exists) {
                    skipped++;
                    continue;
                }
            }
            const channels = (_a = input.channels) !== null && _a !== void 0 ? _a : this.defaultChannels(prefs);
            for (const channel of channels) {
                await this.dispatchChannel({
                    userId,
                    channel,
                    type: input.type,
                    title: input.title,
                    body: input.body,
                    payload: (_b = input.payload) !== null && _b !== void 0 ? _b : {},
                    dedupeKey: perUserDedupe,
                });
                created++;
            }
        }
        return { created, skipped, recipients: input.userIds.length };
    }
    async send(data) {
        var _a, _b;
        const channel = data.channel;
        if (data.userId) {
            return this.dispatchChannel({
                userId: data.userId,
                channel,
                type: data.type,
                title: (_a = data.title) !== null && _a !== void 0 ? _a : data.type,
                body: (_b = data.body) !== null && _b !== void 0 ? _b : '',
                payload: data.payload,
            });
        }
        await this.prisma.notification.create({
            data: {
                channel,
                type: data.type,
                title: data.title,
                body: data.body,
                payload: data.payload,
                status: client_1.NotificationStatus.SENT,
                sentAt: new Date(),
            },
        });
        return { status: 'sent', channel };
    }
    async dispatchChannel(args) {
        var _a, _b;
        const user = await this.prisma.user.findUnique({
            where: { id: args.userId },
            select: {
                id: true,
                email: true,
                worker: { select: { phone: true } },
            },
        });
        if (!user)
            return;
        const prefs = await this.getOrCreatePreferences(args.userId);
        let status = client_1.NotificationStatus.SENT;
        let sentAt = new Date();
        try {
            if (args.channel === client_1.NotificationChannel.EMAIL && prefs.emailEnabled) {
                await this.email.send({
                    to: user.email,
                    subject: args.title,
                    body: args.body,
                });
            }
            else if (args.channel === client_1.NotificationChannel.SMS && prefs.smsEnabled) {
                const phone = (_a = prefs.phone) !== null && _a !== void 0 ? _a : (_b = user.worker) === null || _b === void 0 ? void 0 : _b.phone;
                if (phone) {
                    await this.sms.send({
                        to: phone,
                        message: `${args.title}: ${args.body}`,
                    });
                }
                else {
                    status = client_1.NotificationStatus.FAILED;
                    sentAt = null;
                }
            }
            else if (args.channel === client_1.NotificationChannel.PUSH &&
                prefs.pushEnabled) {
                await this.push.send({
                    deviceToken: `user-${user.id}`,
                    title: args.title,
                    body: args.body,
                });
            }
            else if (args.channel === client_1.NotificationChannel.IN_APP &&
                prefs.inAppEnabled) {
            }
            else if (args.channel !== client_1.NotificationChannel.IN_APP) {
                return;
            }
        }
        catch (e) {
            this.logger.warn(`Channel ${args.channel} failed: ${e}`);
            status = client_1.NotificationStatus.FAILED;
            sentAt = null;
        }
        if (args.channel === client_1.NotificationChannel.IN_APP && !prefs.inAppEnabled) {
            return;
        }
        await this.prisma.notification.create({
            data: {
                userId: args.userId,
                channel: args.channel,
                type: args.type,
                title: args.title,
                body: args.body,
                payload: args.payload,
                status: args.channel === client_1.NotificationChannel.IN_APP
                    ? client_1.NotificationStatus.PENDING
                    : status,
                dedupeKey: args.dedupeKey,
                sentAt,
            },
        });
    }
    defaultChannels(prefs) {
        const channels = [];
        if (prefs.inAppEnabled)
            channels.push(client_1.NotificationChannel.IN_APP);
        if (prefs.emailEnabled)
            channels.push(client_1.NotificationChannel.EMAIL);
        if (prefs.smsEnabled)
            channels.push(client_1.NotificationChannel.SMS);
        if (prefs.pushEnabled)
            channels.push(client_1.NotificationChannel.PUSH);
        return channels.length ? channels : [client_1.NotificationChannel.IN_APP];
    }
    isTypeEnabled(type, prefs) {
        switch (type) {
            case 'INSPECTION_DUE':
                return prefs.inspectionDue;
            case 'COMPETENCY_EXPIRING':
            case 'COMPETENCY_EXPIRED':
                return prefs.competencyExpiry;
            case 'PPE_EXPIRING':
            case 'PPE_EXPIRED':
                return prefs.ppeExpiry;
            case 'MAINTENANCE_DUE':
            case 'MAINTENANCE_AND_CALIBRATION_DUE':
                return prefs.maintenanceDue;
            case 'CALIBRATION_DUE':
                return prefs.calibrationDue;
            case 'SOCIAL_LIKE':
            case 'SOCIAL_COMMENT':
            case 'SOCIAL_SHARE':
            case 'SOCIAL_FOLLOW':
            case 'MODERATION_RESOLVED':
            case 'MODERATION_EXPERT_VERIFICATION':
                return true;
            case 'weather_alert':
            case 'WEATHER_ALERT':
                return true;
            case 'CAIL_OVERDUE':
            case 'CAIL_DUE_SOON':
            case 'CAIL_ASSIGNED':
            case 'TRAINING_VERIFICATION_ATTENTION':
            case 'TRAINING_INGESTION_COMPLETED':
            case 'TRAINING_INGESTION_FAILED':
                return prefs.assignmentAlerts;
            default:
                return prefs.assignmentAlerts;
        }
    }
    inQuietHours(prefs) {
        if (!prefs.quietHoursStart || !prefs.quietHoursEnd)
            return false;
        const now = new Date();
        const [sh, sm] = prefs.quietHoursStart.split(':').map(Number);
        const [eh, em] = prefs.quietHoursEnd.split(':').map(Number);
        const start = sh * 60 + (sm || 0);
        const end = eh * 60 + (em || 0);
        const cur = now.getHours() * 60 + now.getMinutes();
        if (start <= end)
            return cur >= start && cur < end;
        return cur >= start || cur < end;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        sms_service_1.SmsService,
        push_service_1.PushService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map