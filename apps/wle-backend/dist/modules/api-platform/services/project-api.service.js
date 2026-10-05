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
exports.ProjectApiService = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("../../vera-core/projects.service");
const project_repository_1 = require("../repositories/project.repository");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
const event_bus_service_1 = require("../events/event-bus.service");
const domain_events_1 = require("../events/domain-events");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
let ProjectApiService = class ProjectApiService {
    constructor(projects, projectRepo, reporting, events) {
        this.projects = projects;
        this.projectRepo = projectRepo;
        this.reporting = reporting;
        this.events = events;
    }
    create(data) {
        return this.projects.create(data);
    }
    async get(id) {
        const p = await this.projectRepo.findById(id);
        if (!p) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Project not found', {
                id,
            });
        }
        return p;
    }
    assignWorker(projectId, workerId, assignedBy) {
        return this.projects
            .assignWorker(projectId, workerId, assignedBy)
            .then((r) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.PROJECT_ASSIGNED,
                occurredAt: new Date().toISOString(),
                projectId,
                entityType: 'worker',
                entityId: workerId,
            });
            return r;
        });
    }
    assignEquipment(projectId, equipmentId, assignedBy) {
        return this.projects.assignEquipment(projectId, equipmentId, assignedBy);
    }
    readiness(companyId, projectId) {
        return this.reporting.projectReadiness(companyId, projectId);
    }
    close(id) {
        return this.projectRepo.close(id).then((p) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.PROJECT_CLOSED,
                occurredAt: new Date().toISOString(),
                projectId: id,
            });
            return p;
        });
    }
};
exports.ProjectApiService = ProjectApiService;
exports.ProjectApiService = ProjectApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        project_repository_1.ProjectRepository,
        reporting_core_service_1.ReportingCoreService,
        event_bus_service_1.EventBusService])
], ProjectApiService);
//# sourceMappingURL=project-api.service.js.map