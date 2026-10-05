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
exports.IncidentsVsiController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const incidents_vsi_service_1 = require("./incidents-vsi.service");
const incident_investigation_dto_1 = require("../dto/incident-investigation.dto");
const PM_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let IncidentsVsiController = class IncidentsVsiController {
    constructor(incidents, scope) {
        this.incidents = incidents;
        this.scope = scope;
    }
    async list(companyId, siteId, status) {
        return this.incidents.listIncidents({
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            siteId: siteId ? parseInt(siteId, 10) : undefined,
            status,
        });
    }
    async open(id, dto, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.incidents.openInvestigation(parseInt(id, 10), dto, actor);
    }
    async getInvestigation(id) {
        return this.incidents.getInvestigation(parseInt(id, 10));
    }
    async update(id, dto) {
        return this.incidents.updateInvestigation(parseInt(id, 10), dto);
    }
    async aiPack(id) {
        return this.incidents.generateAiPack(parseInt(id, 10));
    }
    async bulkCapa(id, dto, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.incidents.bulkCreateCapa(parseInt(id, 10), dto, actor);
    }
    async listCail(id) {
        return this.incidents.listCailForIncident(parseInt(id, 10));
    }
};
exports.IncidentsVsiController = IncidentsVsiController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('siteId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/investigation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, incident_investigation_dto_1.OpenIncidentInvestigationDto, Object]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "open", null);
__decorate([
    (0, common_1.Get)(':id/investigation'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "getInvestigation", null);
__decorate([
    (0, common_1.Patch)(':id/investigation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, incident_investigation_dto_1.UpdateIncidentInvestigationDto]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/investigation/ai-pack'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "aiPack", null);
__decorate([
    (0, common_1.Post)(':id/corrective-actions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, incident_investigation_dto_1.BulkIncidentCapaDto, Object]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "bulkCapa", null);
__decorate([
    (0, common_1.Get)(':id/cail'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncidentsVsiController.prototype, "listCail", null);
exports.IncidentsVsiController = IncidentsVsiController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/incidents`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [incidents_vsi_service_1.IncidentsVsiService,
        cail_scope_service_1.CailScopeService])
], IncidentsVsiController);
//# sourceMappingURL=incidents-vsi.controller.js.map