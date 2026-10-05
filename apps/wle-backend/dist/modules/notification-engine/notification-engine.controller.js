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
exports.NotificationEngineController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const notifications_service_1 = require("../../notifications/notifications.service");
const roles_1 = require("../vera-core/roles");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
const notification_engine_dto_1 = require("./dto/notification-engine.dto");
let NotificationEngineController = class NotificationEngineController {
    constructor(notifications, scheduler) {
        this.notifications = notifications;
        this.scheduler = scheduler;
    }
    list(req, unreadOnly) {
        return this.notifications.listForUser(req.user.id, {
            unreadOnly: unreadOnly === 'true',
        });
    }
    unreadCount(req) {
        return this.notifications
            .unreadCount(req.user.id)
            .then((count) => ({ count }));
    }
    markRead(req, id) {
        return this.notifications.markRead(req.user.id, id);
    }
    markAllRead(req) {
        return this.notifications.markAllRead(req.user.id);
    }
    getSettings(req) {
        return this.notifications.getOrCreatePreferences(req.user.id);
    }
    updateSettings(req, body) {
        return this.notifications.updatePreferences(req.user.id, body);
    }
    runScheduler(query) {
        return this.scheduler.runAll(query.companyId);
    }
    testSend(req, body) {
        var _a, _b;
        return this.notifications.notifyUsers({
            userIds: [req.user.id],
            type: 'TEST',
            title: (_a = body.title) !== null && _a !== void 0 ? _a : 'Test notification',
            body: (_b = body.body) !== null && _b !== void 0 ? _b : 'This is a test from VERA.',
            payload: { test: true },
        });
    }
};
exports.NotificationEngineController = NotificationEngineController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "unreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('read-all'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "markAllRead", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('scheduler/run'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_engine_dto_1.RunSchedulerQueryDto]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "runScheduler", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NotificationEngineController.prototype, "testSend", null);
exports.NotificationEngineController = NotificationEngineController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/notifications`),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        notification_scheduler_service_1.NotificationSchedulerService])
], NotificationEngineController);
//# sourceMappingURL=notification-engine.controller.js.map