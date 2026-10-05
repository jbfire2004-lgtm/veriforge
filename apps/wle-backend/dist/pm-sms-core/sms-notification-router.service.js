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
var SmsNotificationRouterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsNotificationRouterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const safety_ecosystem_events_service_1 = require("../pm-safety-ecosystem/safety-ecosystem-events.service");
const DEFAULT_ROUTES = [
    {
        eventKey: 'capa.overdue',
        templateKey: 'sms_capa_overdue',
        roles: ['SUPERVISOR', 'PROJECT_MANAGER'],
        channels: ['in_app', 'email'],
    },
    {
        eventKey: 'inspection.finding.critical',
        templateKey: 'sms_inspection_critical',
        roles: ['SUPERVISOR', 'SAFETY'],
        channels: ['in_app', 'email', 'push'],
    },
    {
        eventKey: 'contractor.dispatch.sent',
        templateKey: 'sms_contractor_dispatch',
        roles: ['CONTRACTOR_ADMIN'],
        channels: ['in_app', 'email'],
    },
    {
        eventKey: 'investigation.mandatory',
        templateKey: 'sms_investigation_required',
        roles: ['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN'],
        channels: ['in_app', 'email'],
    },
    {
        eventKey: 'substance.non_negative',
        templateKey: 'sms_substance_non_negative',
        roles: ['ADMIN', 'COMPANY_ADMIN'],
        channels: ['in_app', 'email'],
    },
    {
        eventKey: 'predictive.high_risk',
        templateKey: 'sms_predictive_alert',
        roles: ['SUPERVISOR', 'PROJECT_MANAGER'],
        channels: ['in_app', 'email'],
    },
    {
        eventKey: 'heca.high_energy.escalation',
        templateKey: 'sms_heca_escalation',
        roles: ['SUPERVISOR', 'PROJECT_MANAGER', 'ADMIN'],
        channels: ['in_app', 'email', 'push'],
    },
];
let SmsNotificationRouterService = SmsNotificationRouterService_1 = class SmsNotificationRouterService {
    constructor(prisma, notifications, ecosystem) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.ecosystem = ecosystem;
        this.logger = new common_1.Logger(SmsNotificationRouterService_1.name);
    }
    async listRoutes(companyId) {
        return this.prisma.pmSmsNotificationRoute.findMany({
            where: { companyId, active: true },
            orderBy: { eventKey: 'asc' },
        });
    }
    async ensureDefaultRoutes(companyId) {
        for (const route of DEFAULT_ROUTES) {
            await this.prisma.pmSmsNotificationRoute.upsert({
                where: { companyId_eventKey: { companyId, eventKey: route.eventKey } },
                create: {
                    companyId,
                    eventKey: route.eventKey,
                    templateKey: route.templateKey,
                    rolesJson: route.roles,
                    channelsJson: route.channels,
                },
                update: {},
            });
        }
        return this.listRoutes(companyId);
    }
    async dispatch(payload) {
        var _a, _b, _c, _d;
        const route = await this.prisma.pmSmsNotificationRoute.findUnique({
            where: {
                companyId_eventKey: {
                    companyId: payload.companyId,
                    eventKey: payload.eventKey,
                },
            },
        });
        const channels = (_a = route === null || route === void 0 ? void 0 : route.channelsJson) !== null && _a !== void 0 ? _a : ['in_app'];
        const roles = (_b = route === null || route === void 0 ? void 0 : route.rolesJson) !== null && _b !== void 0 ? _b : [];
        if (payload.hecaEscalation && (route === null || route === void 0 ? void 0 : route.escalateOnHecaHighEnergy)) {
            await this.dispatch(Object.assign(Object.assign({}, payload), { eventKey: 'heca.high_energy.escalation', title: `[HECA Escalation] ${payload.title}` }));
        }
        if (((_c = payload.userIds) === null || _c === void 0 ? void 0 : _c.length) && this.notifications) {
            try {
                await this.notifications.notifyUsers({
                    userIds: payload.userIds,
                    companyId: payload.companyId,
                    type: payload.eventKey,
                    title: payload.title,
                    body: payload.body,
                    channels: channels,
                    payload: Object.assign(Object.assign({}, payload.metadata), { entityType: payload.entityType, entityId: payload.entityId, templateKey: route === null || route === void 0 ? void 0 : route.templateKey, roles }),
                });
            }
            catch (err) {
                this.logger.warn(`Notification dispatch failed: ${err}`);
            }
        }
        (_d = this.ecosystem) === null || _d === void 0 ? void 0 : _d.invalidateHub(payload.companyId, payload.projectId, {
            notification: payload.eventKey,
        });
        return { channels, roles, templateKey: route === null || route === void 0 ? void 0 : route.templateKey };
    }
};
exports.SmsNotificationRouterService = SmsNotificationRouterService;
exports.SmsNotificationRouterService = SmsNotificationRouterService = SmsNotificationRouterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        safety_ecosystem_events_service_1.SafetyEcosystemEventsService])
], SmsNotificationRouterService);
//# sourceMappingURL=sms-notification-router.service.js.map