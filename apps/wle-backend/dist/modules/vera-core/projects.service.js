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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const adoption_event_service_1 = require("../adoption-analytics/adoption-event.service");
const adoption_analytics_constants_1 = require("../adoption-analytics/adoption-analytics.constants");
const orientation_linking_service_1 = require("../orientation/orientation-linking.service");
const orientation_access_service_1 = require("../orientation/orientation-access.service");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const inactivation_service_1 = require("./inactivation.service");
const competency_service_1 = require("../competency/competency.service");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
const vera_event_publishers_1 = require("../vera-event-bus/publishers/vera-event-publishers");
let ProjectsService = class ProjectsService {
    constructor(prisma, inactivation, competency, adoption, orientationLinking, orientationAccess, events) {
        this.prisma = prisma;
        this.inactivation = inactivation;
        this.competency = competency;
        this.adoption = adoption;
        this.orientationLinking = orientationLinking;
        this.orientationAccess = orientationAccess;
        this.events = events;
    }
    async listByCompany(companyId, status) {
        return this.prisma.project.findMany({
            where: Object.assign({ companyId }, (status ? { status } : {})),
            include: { site: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        const project = await this.prisma.project.create({
            data: {
                companyId: data.companyId,
                name: data.name,
                code: data.code,
                siteId: data.siteId,
                startDate: data.startDate,
                status: client_1.ProjectStatus.ACTIVE,
            },
            include: { site: true },
        });
        if (this.adoption) {
            this.adoption.track({
                companyId: data.companyId,
                event: adoption_analytics_constants_1.ADOPTION_EVENT_TYPES.PROJECT_CREATED,
                metadata: { projectId: project.id },
            });
        }
        return project;
    }
    async assignWorker(projectId, workerId, assignedBy, equipmentId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project || project.status !== client_1.ProjectStatus.ACTIVE) {
            throw new common_1.NotFoundException('Project not found or closed');
        }
        const companyLink = await this.prisma.companyLink.findFirst({
            where: {
                workerId,
                companyId: project.companyId,
                active: true,
            },
        });
        if (!companyLink) {
            throw new common_1.BadRequestException('Worker must be active under company');
        }
        if (this.orientationAccess) {
            await this.orientationAccess.assertWorkerCanBeAssigned(workerId, projectId);
        }
        if (equipmentId) {
            await this.competency.assertEligible(workerId, equipmentId);
        }
        const existing = await this.prisma.projectAssignment.findFirst({
            where: {
                projectId,
                workerId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
        });
        if (existing)
            return existing;
        const assignment = await this.prisma.projectAssignment.create({
            data: {
                projectId,
                workerId,
                companyId: project.companyId,
                assignedBy: assignedBy !== null && assignedBy !== void 0 ? assignedBy : null,
                status: client_1.AssignmentStatus.ACTIVE,
            },
            include: { worker: true, project: true },
        });
        if (this.orientationLinking) {
            void this.orientationLinking.onProjectAssignment(workerId, projectId);
        }
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit((0, vera_event_publishers_1.workerAssignedEvent)({
            projectId,
            workerId,
            companyId: project.companyId,
            assignedBy,
        }));
        (_b = this.events) === null || _b === void 0 ? void 0 : _b.emit({
            name: domain_events_1.DomainEvent.PROJECT_UPDATED,
            occurredAt: new Date().toISOString(),
            companyId: project.companyId,
            projectId,
            entityType: 'project',
            entityId: projectId,
            data: { action: 'worker_assigned', workerId },
        });
        return assignment;
    }
    async removeWorker(projectId, workerId) {
        var _a, _b;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const now = new Date();
        await this.prisma.projectAssignment.updateMany({
            where: { projectId, workerId, status: client_1.AssignmentStatus.ACTIVE },
            data: { status: client_1.AssignmentStatus.REMOVED, endedAt: now },
        });
        const otherActive = await this.prisma.projectAssignment.count({
            where: {
                workerId,
                companyId: project.companyId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
        });
        if (otherActive === 0) {
            await this.inactivation.deactivateWorkerAtCompany(workerId, project.companyId, 'REMOVED_FROM_PROJECT');
        }
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit((0, vera_event_publishers_1.workerRemovedEvent)({
            projectId,
            workerId,
            companyId: project.companyId,
        }));
        (_b = this.events) === null || _b === void 0 ? void 0 : _b.emit({
            name: domain_events_1.DomainEvent.PROJECT_UPDATED,
            occurredAt: now.toISOString(),
            companyId: project.companyId,
            projectId,
            entityType: 'project',
            entityId: projectId,
            data: { action: 'worker_removed', workerId },
        });
        return { projectId, workerId, removedAt: now };
    }
    async assignEquipment(projectId, equipmentId, assignedBy) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project || project.status !== client_1.ProjectStatus.ACTIVE) {
            throw new common_1.NotFoundException('Project not found or closed');
        }
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (equipment === null || equipment === void 0 ? void 0 : equipment.lockedOutAt) {
            throw new common_1.BadRequestException('Equipment is locked out');
        }
        const equipmentLink = await this.prisma.equipmentLink.findFirst({
            where: {
                equipmentId,
                companyId: project.companyId,
                active: true,
                complianceStatus: { not: 'LOCKED_OUT' },
            },
        });
        if (!equipmentLink) {
            throw new common_1.BadRequestException('Equipment must be active under company');
        }
        const activeOperators = await this.prisma.equipmentLinkWorker.findMany({
            where: {
                equipmentLink: {
                    equipmentId,
                    companyId: project.companyId,
                    active: true,
                },
            },
            select: { workerId: true },
        });
        if (activeOperators.length > 0) {
            const checks = await Promise.all(activeOperators.map((op) => this.competency.checkWorkerEquipment(op.workerId, equipmentId)));
            const anyEligible = checks.some((c) => c.eligible);
            if (!anyEligible) {
                throw new common_1.BadRequestException('No assigned operator has valid competency for this equipment');
            }
        }
        return this.prisma.equipmentProjectAssignment.create({
            data: {
                projectId,
                equipmentId,
                companyId: project.companyId,
                assignedBy: assignedBy !== null && assignedBy !== void 0 ? assignedBy : null,
                status: client_1.AssignmentStatus.ACTIVE,
            },
            include: { equipment: true, project: true },
        });
    }
    async removeEquipment(projectId, equipmentId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const now = new Date();
        await this.prisma.equipmentProjectAssignment.updateMany({
            where: { projectId, equipmentId, status: client_1.AssignmentStatus.ACTIVE },
            data: { status: client_1.AssignmentStatus.REMOVED, endedAt: now },
        });
        const otherActive = await this.prisma.equipmentProjectAssignment.count({
            where: {
                equipmentId,
                companyId: project.companyId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
        });
        if (otherActive === 0) {
            await this.inactivation.deactivateEquipmentAtCompany(equipmentId, project.companyId, 'REMOVED_FROM_PROJECT');
        }
        return { projectId, equipmentId, removedAt: now };
    }
    async close(projectId) {
        return this.inactivation.closeProject(projectId);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService,
        competency_service_1.CompetencyService,
        adoption_event_service_1.AdoptionEventService,
        orientation_linking_service_1.OrientationLinkingService,
        orientation_access_service_1.OrientationAccessService,
        event_bus_service_1.EventBusService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map