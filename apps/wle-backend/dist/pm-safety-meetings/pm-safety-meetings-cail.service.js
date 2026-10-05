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
exports.PmSafetyMeetingsCailService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PmSafetyMeetingsCailService = class PmSafetyMeetingsCailService {
    constructor(prisma, emitter) {
        this.prisma = prisma;
        this.emitter = emitter;
    }
    async ensureMeetingCail(meetingId, createdByUserId) {
        var _a, _b, _c;
        const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
            where: { id: meetingId },
            include: { topics: true, correctiveLinks: true },
        });
        if (meeting.cailEntryId) {
            return this.prisma.cailEntry.findUnique({
                where: { id: meeting.cailEntryId },
            });
        }
        const hasRisk = meeting.topics.some((t) => t.isHighRisk) ||
            meeting.correctiveLinks.length > 0;
        if (!hasRisk && meeting.status !== 'completed') {
            return null;
        }
        const entry = await this.emitter.emit({
            projectId: meeting.projectId,
            ownerCompanyId: meeting.companyId,
            sourceType: 'safety_meeting',
            sourceId: meeting.id,
            sourceItemId: '',
            title: `Safety meeting: ${meeting.title}`,
            description: (_a = meeting.discussionNotes) !== null && _a !== void 0 ? _a : undefined,
            severity: meeting.topics.some((t) => t.isHighRisk) ? 'high' : 'medium',
            createdByUserId,
            siteId: (_b = meeting.siteId) !== null && _b !== void 0 ? _b : undefined,
            locationNote: (_c = meeting.locationNote) !== null && _c !== void 0 ? _c : undefined,
            tags: ['safety_meeting', meeting.meetingType],
        });
        await this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data: { cailEntryId: entry.id },
        });
        return entry;
    }
};
exports.PmSafetyMeetingsCailService = PmSafetyMeetingsCailService;
exports.PmSafetyMeetingsCailService = PmSafetyMeetingsCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_emitter_service_1.CailEmitterService])
], PmSafetyMeetingsCailService);
//# sourceMappingURL=pm-safety-meetings-cail.service.js.map