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
exports.WorkerExpiryRulesStore = exports.DEFAULT_WORKER_EXPIRY_RULES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
exports.DEFAULT_WORKER_EXPIRY_RULES = {
    orientationExpiryDays: 90,
    certificationExpiryDays: 365,
    notSeenDays: 30,
    autoDeactivate: true,
    autoNotify: true,
};
let WorkerExpiryRulesStore = class WorkerExpiryRulesStore {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRules(companyId) {
        const rows = await this.prisma.$queryRawUnsafe(`
      SELECT
        orientation_expiry_days,
        certification_expiry_days,
        not_seen_days,
        auto_deactivate,
        auto_notify
      FROM worker_lifecycle_rule_set
      WHERE company_id = $1
      LIMIT 1
      `, companyId);
        const row = rows[0];
        if (!row)
            return Object.assign({}, exports.DEFAULT_WORKER_EXPIRY_RULES);
        return {
            orientationExpiryDays: row.orientation_expiry_days,
            certificationExpiryDays: row.certification_expiry_days,
            notSeenDays: row.not_seen_days,
            autoDeactivate: row.auto_deactivate,
            autoNotify: row.auto_notify,
        };
    }
    async saveRules(companyId, patch) {
        const current = await this.getRules(companyId);
        const next = Object.assign(Object.assign({}, current), patch);
        await this.prisma.$executeRawUnsafe(`
      INSERT INTO worker_lifecycle_rule_set (
        company_id,
        orientation_expiry_days,
        certification_expiry_days,
        not_seen_days,
        auto_deactivate,
        auto_notify
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (company_id)
      DO UPDATE SET
        orientation_expiry_days = EXCLUDED.orientation_expiry_days,
        certification_expiry_days = EXCLUDED.certification_expiry_days,
        not_seen_days = EXCLUDED.not_seen_days,
        auto_deactivate = EXCLUDED.auto_deactivate,
        auto_notify = EXCLUDED.auto_notify,
        updated_at = NOW()
      `, companyId, next.orientationExpiryDays, next.certificationExpiryDays, next.notSeenDays, next.autoDeactivate, next.autoNotify);
        return next;
    }
};
exports.WorkerExpiryRulesStore = WorkerExpiryRulesStore;
exports.WorkerExpiryRulesStore = WorkerExpiryRulesStore = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerExpiryRulesStore);
//# sourceMappingURL=worker-expiry-rules.store.js.map