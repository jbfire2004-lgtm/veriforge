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
exports.PmInvestigationCapaIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const pm_inspection_contractor_dispatch_service_1 = require("../pm-inspections/pm-inspection-contractor-dispatch.service");
const pm_inspection_subcontractor_resolver_service_1 = require("../pm-inspections/pm-inspection-subcontractor-resolver.service");
const capa_due_date_engine_1 = require("../pm-corrective-actions/capa-due-date.engine");
const rca_engine_1 = require("./rca.engine");
let PmInvestigationCapaIntegrationService = class PmInvestigationCapaIntegrationService {
    constructor(prisma, capaAuto, dueDate, rca, subcontractorResolver, contractorDispatch) {
        this.prisma = prisma;
        this.capaAuto = capaAuto;
        this.dueDate = dueDate;
        this.rca = rca;
        this.subcontractorResolver = subcontractorResolver;
        this.contractorDispatch = contractorDispatch;
    }
    async createFromRootCause(input) {
        var _a;
        const event = await this.prisma.pmSafetyEvent.findFirst({
            where: { id: input.eventId, deletedAt: null },
        });
        if (!event)
            return null;
        const severity = (_a = input.severity) !== null && _a !== void 0 ? _a : (event.severity === 'critical'
            ? 'critical'
            : event.severity === 'high'
                ? 'high'
                : 'medium');
        let subcontractorCompanyId;
        if (input.responsibleParty === 'contractor' && this.subcontractorResolver) {
            subcontractorCompanyId =
                await this.subcontractorResolver.resolveForFinding(event.projectId, mapPathwayToFindingCategory(input.pathway));
        }
        const unified = await this.capaAuto.fromSafetyEvent(input.eventId, input.rootCauseId, input.actorId);
        if (unified && subcontractorCompanyId) {
            await this.prisma.pmCorrectiveAction.update({
                where: { id: unified.id },
                data: { subcontractorCompanyId },
            });
        }
        const config = await this.prisma.pmCapaCompanyConfig.findUnique({
            where: { companyId: event.companyId },
        });
        const dueAt = this.dueDate.computeDueAt(severity, config !== null && config !== void 0 ? config : undefined);
        const eventCapa = await this.prisma.pmSafetyEventCorrectiveAction.findFirst({
            where: { eventId: input.eventId, rootCauseId: input.rootCauseId },
            orderBy: { createdAt: 'desc' },
        });
        if (eventCapa) {
            await this.prisma.pmSafetyEventCorrectiveAction.update({
                where: { id: eventCapa.id },
                data: {
                    unifiedCorrectiveActionId: unified === null || unified === void 0 ? void 0 : unified.id,
                    subcontractorCompanyId,
                    dueAt,
                },
            });
        }
        if (unified && subcontractorCompanyId && this.contractorDispatch) {
            await this.contractorDispatch.dispatchForCorrectiveAction(unified.id, input.actorId);
        }
        if (input.linkToInspection && unified) {
            await this.prisma.pmCorrectiveActionLink.create({
                data: {
                    actionId: unified.id,
                    linkType: 'inspection',
                    linkedId: input.eventId,
                    linkedMeta: { source: 'investigation' },
                },
            });
        }
        return {
            eventCapa,
            unifiedCorrectiveAction: unified,
            subcontractorCompanyId,
            dueAt,
        };
    }
    buildTaprootJson(pathway, description, factors) {
        return this.rca.buildTaprootPathway({
            pathway,
            description,
            contributingFactors: factors,
        });
    }
};
exports.PmInvestigationCapaIntegrationService = PmInvestigationCapaIntegrationService;
exports.PmInvestigationCapaIntegrationService = PmInvestigationCapaIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService,
        capa_due_date_engine_1.CapaDueDateEngine,
        rca_engine_1.RcaEngine,
        pm_inspection_subcontractor_resolver_service_1.PmInspectionSubcontractorResolverService,
        pm_inspection_contractor_dispatch_service_1.PmInspectionContractorDispatchService])
], PmInvestigationCapaIntegrationService);
function mapPathwayToFindingCategory(pathway) {
    if (pathway === 'equipment_failure')
        return 'equipment_defect';
    if (pathway === 'environmental_conditions')
        return 'environmental';
    if (pathway === 'human_factors')
        return 'missing_ppe';
    return 'unsafe_condition';
}
//# sourceMappingURL=pm-investigation-capa-integration.service.js.map