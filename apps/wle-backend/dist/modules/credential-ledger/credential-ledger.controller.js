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
exports.CredentialLedgerController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const audit_log_service_1 = require("../../audit/audit-log.service");
const routes_1 = require("../../config/routes");
const rbac_1 = require("../../security/rbac");
const credential_ledger_chain_service_1 = require("./credential-ledger-chain.service");
const credential_ledger_backfill_service_1 = require("./credential-ledger-backfill.service");
const credential_ledger_backfill_dto_1 = require("./dto/credential-ledger-backfill.dto");
let CredentialLedgerController = class CredentialLedgerController {
    constructor(chain, backfill, audit) {
        this.chain = chain;
        this.backfill = backfill;
        this.audit = audit;
    }
    async runBackfill(body, req) {
        var _a, _b, _c, _d, _e;
        const result = await this.backfill.backfill(body);
        await this.audit.logAudit(req.user
            ? { id: req.user.id, companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : undefined }
            : null, 'credential_ledger.backfill', { type: 'CredentialLedger', id: 'backfill' }, {
            companyId: (_b = body.companyId) !== null && _b !== void 0 ? _b : null,
            dryRun: (_c = body.dryRun) !== null && _c !== void 0 ? _c : false,
            limit: (_d = body.limit) !== null && _d !== void 0 ? _d : null,
            processed: (_e = result.processed) !== null && _e !== void 0 ? _e : null,
        });
        return result;
    }
    verificationChain(credentialId) {
        return this.chain.resolveVerificationChain(credentialId);
    }
};
exports.CredentialLedgerController = CredentialLedgerController;
__decorate([
    (0, common_1.Post)('backfill'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('credentialLedgerBackfill')),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [credential_ledger_backfill_dto_1.CredentialLedgerBackfillDto, Object]),
    __metadata("design:returntype", Promise)
], CredentialLedgerController.prototype, "runBackfill", null);
__decorate([
    (0, common_1.Get)(':credentialId/verification-chain'),
    __param(0, (0, common_1.Param)('credentialId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CredentialLedgerController.prototype, "verificationChain", null);
exports.CredentialLedgerController = CredentialLedgerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('viewCredentialChain')),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/credential-ledger`),
    __metadata("design:paramtypes", [credential_ledger_chain_service_1.CredentialLedgerChainService,
        credential_ledger_backfill_service_1.CredentialLedgerBackfillService,
        audit_log_service_1.AuditLogService])
], CredentialLedgerController);
//# sourceMappingURL=credential-ledger.controller.js.map