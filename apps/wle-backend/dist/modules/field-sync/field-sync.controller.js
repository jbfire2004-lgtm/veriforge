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
exports.FieldSyncController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const field_sync_dto_1 = require("./dto/field-sync.dto");
const field_sync_service_1 = require("./field-sync.service");
let FieldSyncController = class FieldSyncController {
    constructor(fieldSync) {
        this.fieldSync = fieldSync;
    }
    delta(companyId, since) {
        return this.fieldSync.fetchDelta({
            companyId: companyId ? Number(companyId) : undefined,
            since,
        });
    }
    offlineBundle(companyId, workerId) {
        return this.fieldSync.fetchOfflineBundle({
            companyId: companyId ? Number(companyId) : undefined,
            workerId: workerId ? Number(workerId) : undefined,
        });
    }
    registerOfflineScan(body, req) {
        return this.fieldSync.registerOfflineScan(body, req.user.id);
    }
    syncBatch(body, req) {
        return this.fieldSync.processBatch(body.actions.map((a) => ({
            type: a.type,
            payload: a.payload,
            clientTimestamp: a.clientTimestamp,
            clientVersion: a.clientVersion,
        })), req.user.id, { batchId: body.batchId, clientId: body.clientId });
    }
};
exports.FieldSyncController = FieldSyncController;
__decorate([
    (0, common_1.Get)('delta'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FieldSyncController.prototype, "delta", null);
__decorate([
    (0, common_1.Get)('offline-bundle'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FieldSyncController.prototype, "offlineBundle", null);
__decorate([
    (0, common_1.Post)('offline-registry'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FieldSyncController.prototype, "registerOfflineScan", null);
__decorate([
    (0, common_1.Post)('sync-batch'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [field_sync_dto_1.FieldSyncBatchDto, Object]),
    __metadata("design:returntype", void 0)
], FieldSyncController.prototype, "syncBatch", null);
exports.FieldSyncController = FieldSyncController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/field`),
    __metadata("design:paramtypes", [field_sync_service_1.FieldSyncService])
], FieldSyncController);
//# sourceMappingURL=field-sync.controller.js.map