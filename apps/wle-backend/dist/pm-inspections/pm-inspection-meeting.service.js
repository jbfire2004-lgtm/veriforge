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
exports.PmInspectionMeetingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_meetings_service_1 = require("../pm-safety-meetings/pm-safety-meetings.service");
const pm_inspection_automation_config_service_1 = require("./pm-inspection-automation-config.service");
const pm_inspections_constants_1 = require("./pm-inspections.constants");
let PmInspectionMeetingService = class PmInspectionMeetingService {
    constructor(prisma, automationConfig, safetyMeetings) {
        this.prisma = prisma;
        this.automationConfig = automationConfig;
        this.safetyMeetings = safetyMeetings;
    }
    async findExistingMeeting(inspectionId) {
        return this.prisma.safetyMeeting.findFirst({
            where: { pmInspectionId: inspectionId, deletedAt: null },
        });
    }
    async createDraftIfFailedOnSubmit(inspectionId, actorId) {
        if (!this.safetyMeetings)
            return null;
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            select: {
                id: true,
                passed: true,
                companyId: true,
                projectId: true,
            },
        });
        if (!inspection || !(0, pm_inspections_constants_1.inspectionFailedForAutoMeeting)(inspection.passed)) {
            return null;
        }
        const enabled = await this.automationConfig.isAutoFailureMeetingEnabled(inspection.companyId);
        if (!enabled)
            return null;
        const result = await this.safetyMeetings.createFromInspection(inspectionId, actorId);
        return {
            inspectionId,
            meetingId: result.meeting.id,
            projectId: inspection.projectId,
            existing: result.existing,
            meeting: result.meeting,
        };
    }
};
exports.PmInspectionMeetingService = PmInspectionMeetingService;
exports.PmInspectionMeetingService = PmInspectionMeetingService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_inspection_automation_config_service_1.PmInspectionAutomationConfigService,
        pm_safety_meetings_service_1.PmSafetyMeetingsService])
], PmInspectionMeetingService);
//# sourceMappingURL=pm-inspection-meeting.service.js.map