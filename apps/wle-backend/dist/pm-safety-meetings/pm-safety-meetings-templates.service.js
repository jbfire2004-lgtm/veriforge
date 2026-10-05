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
exports.PmSafetyMeetingsTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_meetings_constants_1 = require("./pm-safety-meetings.constants");
let PmSafetyMeetingsTemplatesService = class PmSafetyMeetingsTemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(companyId, projectId, meetingType) {
        return this.prisma.safetyMeetingTemplate.findMany({
            where: Object.assign(Object.assign({ companyId, deletedAt: null, status: { in: ['draft', 'published'] } }, (projectId
                ? { OR: [{ projectId: null }, { projectId }] }
                : { projectId: null })), (meetingType ? { meetingType: meetingType } : {})),
            orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        });
    }
    async create(data) {
        var _a, _b;
        return this.prisma.safetyMeetingTemplate.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                meetingType: data.meetingType,
                name: data.name,
                description: data.description,
                agendaJson: ((_a = data.agendaJson) !== null && _a !== void 0 ? _a : []),
                requiredTopicIds: ((_b = data.requiredTopicIds) !== null && _b !== void 0 ? _b : []),
                status: 'draft',
                version: 1,
            },
        });
    }
    async publish(templateId, userId) {
        var _a, _b;
        const tpl = await this.prisma.safetyMeetingTemplate.findUniqueOrThrow({
            where: { id: templateId },
        });
        if (tpl.status === 'archived') {
            throw new common_1.BadRequestException('Cannot publish archived template');
        }
        const newVersion = await this.prisma.safetyMeetingTemplate.create({
            data: {
                companyId: tpl.companyId,
                projectId: tpl.projectId,
                meetingType: tpl.meetingType,
                name: tpl.name,
                description: tpl.description,
                agendaJson: (_a = tpl.agendaJson) !== null && _a !== void 0 ? _a : [],
                requiredTopicIds: (_b = tpl.requiredTopicIds) !== null && _b !== void 0 ? _b : [],
                version: tpl.version + 1,
                status: 'published',
                publishedAt: new Date(),
                publishedByUserId: userId,
                parentTemplateId: tpl.id,
            },
        });
        await this.prisma.safetyMeetingTemplate.update({
            where: { id: templateId },
            data: { status: 'archived' },
        });
        return newVersion;
    }
    async ensureInspectionFailureReviewTemplate(companyId, projectId) {
        const existing = await this.prisma.safetyMeetingTemplate.findFirst({
            where: Object.assign({ companyId, name: pm_safety_meetings_constants_1.INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME, deletedAt: null, status: 'published' }, (projectId
                ? { OR: [{ projectId: null }, { projectId }] }
                : { projectId: null })),
            orderBy: { version: 'desc' },
        });
        if (existing)
            return existing;
        return this.prisma.safetyMeetingTemplate.create({
            data: {
                companyId,
                projectId: projectId !== null && projectId !== void 0 ? projectId : null,
                meetingType: 'incident_review_meeting',
                name: pm_safety_meetings_constants_1.INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME,
                description: 'Standard safety meeting agenda when a field inspection fails.',
                agendaJson: pm_safety_meetings_constants_1.DEFAULT_INSPECTION_FAILURE_AGENDA,
                status: 'published',
                publishedAt: new Date(),
                version: 1,
            },
        });
    }
};
exports.PmSafetyMeetingsTemplatesService = PmSafetyMeetingsTemplatesService;
exports.PmSafetyMeetingsTemplatesService = PmSafetyMeetingsTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmSafetyMeetingsTemplatesService);
//# sourceMappingURL=pm-safety-meetings-templates.service.js.map