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
var ProjectComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectComplianceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const project_compliance_evaluator_1 = require("./project-compliance-evaluator");
let ProjectComplianceService = ProjectComplianceService_1 = class ProjectComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProjectComplianceService_1.name);
    }
    async evaluateProject(projectId) {
        var _a;
        const started = Date.now();
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                companyId: true,
                client: true,
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const [assignments, rules] = await Promise.all([
            this.prisma.projectAssignment.findMany({
                where: {
                    projectId,
                    status: client_1.AssignmentStatus.ACTIVE,
                    endedAt: null,
                },
                select: {
                    workerId: true,
                    role: true,
                    worker: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.loadRules(projectId),
        ]);
        const workerIds = assignments.map((a) => a.workerId);
        const certIds = [...new Set(rules.map((r) => r.requiredCredentialTypeId))];
        const [credentials, companyLinks, safetyProfiles] = await Promise.all([
            certIds.length && workerIds.length
                ? this.prisma.trainingRecord.findMany({
                    where: {
                        workerId: { in: workerIds },
                        certificationId: { in: certIds },
                        OR: [{ projectId }, { projectId: null }],
                    },
                    select: {
                        id: true,
                        workerId: true,
                        certificationId: true,
                        expiresAt: true,
                        lastVerificationStatus: true,
                    },
                })
                : Promise.resolve([]),
            workerIds.length
                ? this.prisma.companyLink.findMany({
                    where: {
                        workerId: { in: workerIds },
                        companyId: project.companyId,
                        active: true,
                    },
                    select: { workerId: true, role: true, trade: true },
                })
                : Promise.resolve([]),
            workerIds.length
                ? this.prisma.pmWorkerSafetyProfile.findMany({
                    where: { workerId: { in: workerIds } },
                    select: { workerId: true, roleType: true, tradeCode: true },
                })
                : Promise.resolve([]),
        ]);
        const linkByWorker = new Map(companyLinks.map((l) => [l.workerId, l]));
        const profileByWorker = new Map(safetyProfiles.map((p) => [p.workerId, p]));
        const credsByWorker = new Map();
        for (const c of credentials) {
            const list = (_a = credsByWorker.get(c.workerId)) !== null && _a !== void 0 ? _a : [];
            list.push(c);
            credsByWorker.set(c.workerId, list);
        }
        const workers = assignments.map((a) => {
            var _a, _b, _c, _d, _e, _f;
            const link = linkByWorker.get(a.workerId);
            const profile = profileByWorker.get(a.workerId);
            const worker = {
                id: a.worker.id,
                firstName: a.worker.firstName,
                lastName: a.worker.lastName,
                role: (_c = (_b = (_a = a.role) !== null && _a !== void 0 ? _a : link === null || link === void 0 ? void 0 : link.role) !== null && _b !== void 0 ? _b : profile === null || profile === void 0 ? void 0 : profile.roleType) !== null && _c !== void 0 ? _c : null,
                trade: (_e = (_d = link === null || link === void 0 ? void 0 : link.trade) !== null && _d !== void 0 ? _d : profile === null || profile === void 0 ? void 0 : profile.tradeCode) !== null && _e !== void 0 ? _e : null,
            };
            return (0, project_compliance_evaluator_1.evaluateWorkerCompliance)(worker, rules, (_f = credsByWorker.get(a.workerId)) !== null && _f !== void 0 ? _f : []);
        });
        const summary = (0, project_compliance_evaluator_1.aggregateProjectCompliance)(project.id, project.name, project.companyId, project.client, workers);
        const report = Object.assign(Object.assign({ projectId: project.id, projectName: project.name, companyId: project.companyId, client: project.client }, summary), { totalWorkers: workers.length, evaluatedAt: new Date().toISOString() });
        this.logger.log(JSON.stringify({
            type: 'project_compliance.project.evaluate',
            projectId,
            workers: workers.length,
            compliant: report.compliantWorkers.length,
            nonCompliant: report.nonCompliantWorkers.length,
            durationMs: Date.now() - started,
        }));
        return report;
    }
    async evaluateWorkerOnProject(projectId, workerId) {
        var _a, _b, _c, _d, _e;
        const started = Date.now();
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true, companyId: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const assignment = await this.prisma.projectAssignment.findFirst({
            where: {
                projectId,
                workerId,
                status: client_1.AssignmentStatus.ACTIVE,
                endedAt: null,
            },
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Worker is not assigned to this project');
        }
        const rules = await this.loadRules(projectId);
        const certIds = [...new Set(rules.map((r) => r.requiredCredentialTypeId))];
        const [records, link, profile] = await Promise.all([
            certIds.length
                ? this.prisma.trainingRecord.findMany({
                    where: {
                        workerId,
                        certificationId: { in: certIds },
                        OR: [{ projectId }, { projectId: null }],
                    },
                    include: {
                        certification: { select: { id: true, code: true, name: true } },
                    },
                })
                : Promise.resolve([]),
            this.prisma.companyLink.findFirst({
                where: { workerId, companyId: project.companyId, active: true },
                select: { role: true, trade: true },
            }),
            this.prisma.pmWorkerSafetyProfile.findUnique({
                where: { workerId },
                select: { roleType: true, tradeCode: true },
            }),
        ]);
        const workerCtx = {
            id: assignment.worker.id,
            firstName: assignment.worker.firstName,
            lastName: assignment.worker.lastName,
            role: (_c = (_b = (_a = assignment.role) !== null && _a !== void 0 ? _a : link === null || link === void 0 ? void 0 : link.role) !== null && _b !== void 0 ? _b : profile === null || profile === void 0 ? void 0 : profile.roleType) !== null && _c !== void 0 ? _c : null,
            trade: (_e = (_d = link === null || link === void 0 ? void 0 : link.trade) !== null && _d !== void 0 ? _d : profile === null || profile === void 0 ? void 0 : profile.tradeCode) !== null && _e !== void 0 ? _e : null,
        };
        const evaluation = (0, project_compliance_evaluator_1.evaluateWorkerCompliance)(workerCtx, rules, records.map((r) => ({
            id: r.id,
            certificationId: r.certificationId,
            expiresAt: r.expiresAt,
            lastVerificationStatus: r.lastVerificationStatus,
        })));
        const now = new Date();
        const expiringCutoff = new Date(now.getTime() + 30 * 86400000);
        const recordByCert = new Map(records.map((r) => [r.certificationId, r]));
        const detail = Object.assign(Object.assign({}, evaluation), { projectId: project.id, projectName: project.name, required: rules
                .filter((rule) => (0, project_compliance_evaluator_1.ruleAppliesToWorker)(rule, workerCtx))
                .map((rule) => {
                var _a, _b, _c;
                const match = recordByCert.get(rule.requiredCredentialTypeId);
                let status = 'missing';
                if (match) {
                    if (match.expiresAt && match.expiresAt <= now)
                        status = 'expired';
                    else if (match.expiresAt && match.expiresAt <= expiringCutoff) {
                        status = 'expiring_soon';
                    }
                    else
                        status = 'valid';
                }
                return {
                    ruleId: rule.id,
                    ruleType: rule.ruleType,
                    certificationId: rule.requiredCredentialTypeId,
                    certificationCode: rule.certificationCode,
                    certificationName: rule.certificationName,
                    status,
                    credentialId: (_a = match === null || match === void 0 ? void 0 : match.id) !== null && _a !== void 0 ? _a : null,
                    expiresAt: (_c = (_b = match === null || match === void 0 ? void 0 : match.expiresAt) === null || _b === void 0 ? void 0 : _b.toISOString()) !== null && _c !== void 0 ? _c : null,
                };
            }), actual: records.map((r) => {
                var _a, _b;
                let status = 'valid';
                if (r.expiresAt && r.expiresAt <= now)
                    status = 'expired';
                else if (r.expiresAt && r.expiresAt <= expiringCutoff) {
                    status = 'expiring_soon';
                }
                return {
                    credentialId: r.id,
                    certificationId: r.certificationId,
                    certificationCode: r.certification.code,
                    certificationName: r.certification.name,
                    expiresAt: (_b = (_a = r.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                    status,
                    lastVerificationStatus: r.lastVerificationStatus,
                };
            }) });
        this.logger.log(JSON.stringify({
            type: 'project_compliance.worker.evaluate',
            projectId,
            workerId,
            requiredCount: detail.required.length,
            actualCount: detail.actual.length,
            durationMs: Date.now() - started,
        }));
        return detail;
    }
    async listRules(projectId) {
        return this.prisma.projectComplianceRule.findMany({
            where: { projectId, active: true },
            include: {
                certification: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createRule(projectId, body) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.projectComplianceRule.create({
            data: {
                projectId,
                companyId: project.companyId,
                ruleType: body.ruleType,
                requiredCredentialTypeId: body.requiredCredentialTypeId,
                metadata: ((_a = body.metadata) !== null && _a !== void 0 ? _a : {}),
            },
            include: {
                certification: { select: { id: true, code: true, name: true } },
            },
        });
    }
    async loadRules(projectId) {
        const rows = await this.prisma.projectComplianceRule.findMany({
            where: { projectId, active: true },
            include: {
                certification: { select: { code: true, name: true } },
            },
        });
        return rows.map((r) => {
            var _a;
            return ({
                id: r.id,
                ruleType: r.ruleType,
                requiredCredentialTypeId: r.requiredCredentialTypeId,
                certificationCode: r.certification.code,
                certificationName: r.certification.name,
                metadata: ((_a = r.metadata) !== null && _a !== void 0 ? _a : {}),
            });
        });
    }
};
exports.ProjectComplianceService = ProjectComplianceService;
exports.ProjectComplianceService = ProjectComplianceService = ProjectComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectComplianceService);
//# sourceMappingURL=project-compliance.service.js.map