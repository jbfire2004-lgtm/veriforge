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
exports.ReportingCoreController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const reporting_query_dto_1 = require("./dto/reporting-query.dto");
const reporting_core_service_1 = require("./reporting-core.service");
let ReportingCoreController = class ReportingCoreController {
    constructor(reporting) {
        this.reporting = reporting;
    }
    overview(query) {
        return this.reporting.overview(query.companyId);
    }
    workers(query) {
        var _a;
        return this.reporting.workerCompliance(query.companyId, (_a = query.limit) !== null && _a !== void 0 ? _a : 200);
    }
    equipment(query) {
        return this.reporting.equipmentCompliance(query.companyId);
    }
    competency(query) {
        return this.reporting.competencyStatus(query.companyId);
    }
    inspections(query) {
        return this.reporting.inspectionStatus(query.companyId);
    }
    projects(query) {
        return this.reporting.projectReadiness(query.companyId, query.projectId);
    }
    companies(query) {
        var _a;
        if (query.companyId) {
            return this.reporting.companyReadiness(query.companyId);
        }
        return this.reporting.companiesReadinessSummary((_a = query.limit) !== null && _a !== void 0 ? _a : 25);
    }
    unionHalls(query) {
        return this.reporting.unionDispatchStatus(query.unionHallId, query.companyId, query.from ? new Date(query.from) : undefined, query.to ? new Date(query.to) : undefined);
    }
    async exportWorkers(query) {
        const csv = await this.reporting.exportWorkersCsv(query.companyId);
        return new common_1.StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
    }
    async exportEquipment(query) {
        const csv = await this.reporting.exportEquipmentCsv(query.companyId);
        return new common_1.StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
    }
    async exportProjects(query) {
        const csv = await this.reporting.exportProjectsCsv(query.companyId);
        return new common_1.StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
    }
    async exportUnionDispatch(query) {
        const csv = await this.reporting.exportUnionDispatchCsv(query.unionHallId, query.companyId, query.from ? new Date(query.from) : undefined, query.to ? new Date(query.to) : undefined);
        return new common_1.StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
    }
};
exports.ReportingCoreController = ReportingCoreController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('workers'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "workers", null);
__decorate([
    (0, common_1.Get)('equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "equipment", null);
__decorate([
    (0, common_1.Get)('competency'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "competency", null);
__decorate([
    (0, common_1.Get)('inspections'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "inspections", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "projects", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "companies", null);
__decorate([
    (0, common_1.Get)('union-halls'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", void 0)
], ReportingCoreController.prototype, "unionHalls", null);
__decorate([
    (0, common_1.Get)('export/workers'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="worker-compliance.csv"'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", Promise)
], ReportingCoreController.prototype, "exportWorkers", null);
__decorate([
    (0, common_1.Get)('export/equipment'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="equipment-compliance.csv"'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", Promise)
], ReportingCoreController.prototype, "exportEquipment", null);
__decorate([
    (0, common_1.Get)('export/projects'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="project-readiness.csv"'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", Promise)
], ReportingCoreController.prototype, "exportProjects", null);
__decorate([
    (0, common_1.Get)('export/union-dispatch'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="union-dispatch.csv"'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reporting_query_dto_1.ReportingQueryDto]),
    __metadata("design:returntype", Promise)
], ReportingCoreController.prototype, "exportUnionDispatch", null);
exports.ReportingCoreController = ReportingCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/reporting`),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService])
], ReportingCoreController);
//# sourceMappingURL=reporting-core.controller.js.map