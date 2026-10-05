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
exports.WorkerApiService = void 0;
const common_1 = require("@nestjs/common");
const workers_service_1 = require("../../../workers/workers.service");
const registry_service_1 = require("../../vera-core/registry.service");
const company_links_service_1 = require("../../vera-core/company-links.service");
const projects_service_1 = require("../../vera-core/projects.service");
const wallets_service_1 = require("../../vera-core/wallets.service");
const training_pipeline_service_1 = require("../../vera-core/training-pipeline.service");
const worker_training_hydration_service_1 = require("../../../workers/worker-training-hydration.service");
const worker_project_readiness_service_1 = require("../../../workers/worker-project-readiness.service");
const client_1 = require("@prisma/client");
const worker_repository_1 = require("../repositories/worker.repository");
const event_bus_service_1 = require("../events/event-bus.service");
const domain_events_1 = require("../events/domain-events");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
let WorkerApiService = class WorkerApiService {
    constructor(workers, registry, companyLinks, projects, wallets, trainingPipeline, trainingHydration, projectReadiness, workerRepo, events) {
        this.workers = workers;
        this.registry = registry;
        this.companyLinks = companyLinks;
        this.projects = projects;
        this.wallets = wallets;
        this.trainingPipeline = trainingPipeline;
        this.trainingHydration = trainingHydration;
        this.projectReadiness = projectReadiness;
        this.workerRepo = workerRepo;
        this.events = events;
    }
    async getWorker(id) {
        const worker = await this.workerRepo.findById(id);
        if (!worker) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Worker not found', {
                id,
            });
        }
        return worker;
    }
    searchWorkers(query) {
        const where = Object.assign(Object.assign({}, (query.companyId ? { companyId: query.companyId } : {})), (query.q
            ? {
                OR: [
                    {
                        firstName: { contains: query.q, mode: 'insensitive' },
                    },
                    { lastName: { contains: query.q, mode: 'insensitive' } },
                    { email: { contains: query.q, mode: 'insensitive' } },
                ],
            }
            : {}));
        return this.workerRepo.search(where, {
            page: query.page,
            pageSize: query.pageSize,
        });
    }
    createWorker(body) {
        return this.workers.create(body).then((w) => {
            var _a;
            this.events.emit({
                name: domain_events_1.DomainEvent.WORKER_CREATED,
                occurredAt: new Date().toISOString(),
                entityType: 'worker',
                entityId: w.id,
                companyId: (_a = w.companyId) !== null && _a !== void 0 ? _a : undefined,
            });
            return w;
        });
    }
    updateWorker(id, body) {
        return this.workers.update(id, body).then((w) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.WORKER_UPDATED,
                occurredAt: new Date().toISOString(),
                entityType: 'worker',
                entityId: id,
            });
            return w;
        });
    }
    async linkCompany(workerId, companyId, role, trade) {
        var _a;
        const link = await this.companyLinks.linkWorker(workerId, companyId, {
            role,
            trade,
        });
        this.events.emit({
            name: domain_events_1.DomainEvent.WORKER_LINKED,
            occurredAt: new Date().toISOString(),
            entityType: 'worker',
            entityId: workerId,
            companyId,
        });
        const training = await this.trainingHydration
            .hydrateWorkerTraining(workerId, {
            roleType: role &&
                Object.values(client_1.PmCompanyTrainingRoleType).includes(role)
                ? role
                : undefined,
        })
            .catch(() => null);
        return Object.assign(Object.assign({}, link), { trainingSummary: (_a = training === null || training === void 0 ? void 0 : training.summary) !== null && _a !== void 0 ? _a : null });
    }
    async unlinkCompany(workerId, companyId) {
        await this.companyLinks.endAssignment(workerId, companyId);
        this.events.emit({
            name: domain_events_1.DomainEvent.WORKER_UNLINKED,
            occurredAt: new Date().toISOString(),
            entityType: 'worker',
            entityId: workerId,
            companyId,
        });
        return { ok: true };
    }
    assignProject(workerId, projectId) {
        return this.projects.assignWorker(projectId, workerId).then(async (r) => {
            var _a;
            this.events.emit({
                name: domain_events_1.DomainEvent.PROJECT_ASSIGNED,
                occurredAt: new Date().toISOString(),
                entityType: 'worker',
                entityId: workerId,
                projectId,
            });
            const training = await this.trainingHydration
                .hydrateWorkerTraining(workerId, { projectId })
                .catch(() => null);
            return Object.assign(Object.assign({}, r), { trainingSummary: (_a = training === null || training === void 0 ? void 0 : training.summary) !== null && _a !== void 0 ? _a : null });
        });
    }
    getWallet(workerId) {
        return this.wallets.getWorkerWallet(workerId);
    }
    getWorkerTraining(workerId, options) {
        const roleType = (options === null || options === void 0 ? void 0 : options.roleType) &&
            Object.values(client_1.PmCompanyTrainingRoleType).includes(options.roleType)
            ? options.roleType
            : undefined;
        return this.trainingHydration.hydrateWorkerTraining(workerId, Object.assign(Object.assign({}, options), { roleType }));
    }
    getWorkerProjectReadiness(workerId, projectId) {
        return this.projectReadiness.evaluate(workerId, projectId);
    }
    uploadTraining(body) {
        return this.trainingPipeline.ingest(body).then((r) => {
            this.events.emit({
                name: domain_events_1.DomainEvent.TRAINING_UPLOADED,
                occurredAt: new Date().toISOString(),
                entityType: 'training',
                entityId: r === null || r === void 0 ? void 0 : r.id,
                data: body,
            });
            return r;
        });
    }
};
exports.WorkerApiService = WorkerApiService;
exports.WorkerApiService = WorkerApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workers_service_1.WorkersService,
        registry_service_1.RegistryService,
        company_links_service_1.CompanyLinksService,
        projects_service_1.ProjectsService,
        wallets_service_1.WalletsService,
        training_pipeline_service_1.TrainingPipelineService,
        worker_training_hydration_service_1.WorkerTrainingHydrationService,
        worker_project_readiness_service_1.WorkerProjectReadinessService,
        worker_repository_1.WorkerRepository,
        event_bus_service_1.EventBusService])
], WorkerApiService);
//# sourceMappingURL=worker-api.service.js.map