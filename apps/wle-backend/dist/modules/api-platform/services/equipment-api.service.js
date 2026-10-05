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
exports.EquipmentApiService = void 0;
const common_1 = require("@nestjs/common");
const equipment_core_service_1 = require("../../equipment-core/equipment-core.service");
const equipment_links_service_1 = require("../../vera-core/equipment-links.service");
const projects_service_1 = require("../../vera-core/projects.service");
const equipment_repository_1 = require("../repositories/equipment.repository");
const event_bus_service_1 = require("../events/event-bus.service");
const domain_events_1 = require("../events/domain-events");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
let EquipmentApiService = class EquipmentApiService {
    constructor(equipmentCore, equipmentLinks, projects, equipmentRepo, events) {
        this.equipmentCore = equipmentCore;
        this.equipmentLinks = equipmentLinks;
        this.projects = projects;
        this.equipmentRepo = equipmentRepo;
        this.events = events;
    }
    async getEquipment(id) {
        const row = await this.equipmentRepo.findById(id);
        if (!row) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Equipment not found', {
                id,
            });
        }
        return row;
    }
    list(companyId, page, pageSize) {
        return this.equipmentRepo.list(companyId ? { companyId } : {}, {
            page,
            pageSize,
        });
    }
    create(body) {
        return this.equipmentCore.create(body).then((e) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.EQUIPMENT_CREATED,
                occurredAt: new Date().toISOString(),
                entityType: 'equipment',
                entityId: e.id,
            });
            return e;
        });
    }
    update(id, body) {
        return this.equipmentCore.update(id, body).then((e) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.EQUIPMENT_UPDATED,
                occurredAt: new Date().toISOString(),
                entityType: 'equipment',
                entityId: id,
            });
            return e;
        });
    }
    linkCompany(equipmentId, companyId) {
        return this.equipmentLinks
            .linkEquipment(equipmentId, companyId)
            .then((link) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.EQUIPMENT_LINKED,
                occurredAt: new Date().toISOString(),
                entityType: 'equipment',
                entityId: equipmentId,
                companyId,
            });
            return link;
        });
    }
    assignProject(equipmentId, projectId) {
        return this.projects.assignEquipment(projectId, equipmentId).then((r) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.PROJECT_ASSIGNED,
                occurredAt: new Date().toISOString(),
                entityType: 'equipment',
                entityId: equipmentId,
                projectId,
            });
            return r;
        });
    }
    lockout(equipmentId, reason, userId) {
        return this.equipmentCore.lockout(equipmentId, { reason }, userId);
    }
    unlock(equipmentId, notes, userId) {
        return this.equipmentCore.unlock(equipmentId, userId, notes);
    }
    getWallet(equipmentId) {
        return this.equipmentCore.getWallet(equipmentId);
    }
};
exports.EquipmentApiService = EquipmentApiService;
exports.EquipmentApiService = EquipmentApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [equipment_core_service_1.EquipmentCoreService,
        equipment_links_service_1.EquipmentLinksService,
        projects_service_1.ProjectsService,
        equipment_repository_1.EquipmentRepository,
        event_bus_service_1.EventBusService])
], EquipmentApiService);
//# sourceMappingURL=equipment-api.service.js.map