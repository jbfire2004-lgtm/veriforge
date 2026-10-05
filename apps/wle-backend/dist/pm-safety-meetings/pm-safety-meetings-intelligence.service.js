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
exports.PmSafetyMeetingsIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmSafetyMeetingsIntelligenceService = class PmSafetyMeetingsIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scoreMeeting(meetingId) {
        var _a, _b;
        const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
            where: { id: meetingId },
            include: {
                topics: true,
                attendees: true,
                signatures: true,
                correctiveLinks: true,
                attachments: true,
            },
        });
        const factors = [];
        let quality = 50;
        let engagement = 40;
        const present = meeting.attendees.filter((a) => a.status === 'present');
        const signRate = present.length > 0 ? meeting.signatures.length / present.length : 0;
        engagement += Math.round(signRate * 35);
        factors.push({
            name: 'attendance_sign_rate',
            impact: Math.round(signRate * 35),
            explanation: `${meeting.signatures.length}/${present.length} present attendees signed`,
        });
        if (meeting.topics.length >= 2) {
            quality += 10;
            factors.push({
                name: 'topic_depth',
                impact: 10,
                explanation: `${meeting.topics.length} topics covered`,
            });
        }
        if (meeting.discussionNotes && meeting.discussionNotes.length > 80) {
            quality += 15;
            factors.push({
                name: 'discussion_notes',
                impact: 15,
                explanation: 'Substantive discussion notes recorded',
            });
        }
        if (meeting.attachments.length > 0) {
            quality += 10;
            engagement += 5;
            factors.push({
                name: 'evidence_attachments',
                impact: 10,
                explanation: `${meeting.attachments.length} attachments`,
            });
        }
        const hazards = (_a = meeting.hazardsDiscussed) !== null && _a !== void 0 ? _a : [];
        const controls = (_b = meeting.controlsDiscussed) !== null && _b !== void 0 ? _b : [];
        const hazardPatterns = [...new Set(hazards)].slice(0, 8);
        const weakControls = [];
        if (hazards.length > controls.length) {
            weakControls.push('More hazards discussed than controls — verify adequate controls');
            quality -= 15;
        }
        const correlations = await this.correlate(meeting.projectId, meeting.topics);
        quality = Math.max(0, Math.min(100, quality));
        engagement = Math.max(0, Math.min(100, engagement));
        await this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data: { qualityScore: quality, engagementScore: engagement },
        });
        return {
            meetingId,
            qualityScore: quality,
            engagementScore: engagement,
            factors,
            hazardPatterns,
            weakControls,
            correlations,
        };
    }
    async correlate(projectId, topics) {
        const jhaIds = [];
        const inspectionIds = [];
        const incidentIds = [];
        const capaIds = [];
        for (const t of topics) {
            if (!t.sourceModule || !t.sourceId)
                continue;
            if (t.sourceModule === 'jha_flha')
                jhaIds.push(t.sourceId);
            if (t.sourceModule === 'inspection')
                inspectionIds.push(t.sourceId);
            if (t.sourceModule === 'incident')
                incidentIds.push(t.sourceId);
        }
        const links = await this.prisma.safetyMeetingCorrectiveAction.findMany({
            where: { meeting: { projectId } },
            select: { correctiveActionId: true },
            take: 20,
        });
        capaIds.push(...links.map((l) => l.correctiveActionId));
        return { jhaIds, inspectionIds, incidentIds, capaIds };
    }
    async projectAnalytics(projectId) {
        var _a;
        const since30 = new Date(Date.now() - 30 * 86400000);
        const meetings = await this.prisma.safetyMeeting.findMany({
            where: { projectId, deletedAt: null, createdAt: { gte: since30 } },
            include: { attendees: true, correctiveLinks: true },
        });
        const byType = {};
        let totalAttendees = 0;
        let totalPresent = 0;
        let capaFromMeetings = 0;
        let avgQuality = 0;
        let qualityCount = 0;
        for (const m of meetings) {
            byType[m.meetingType] = ((_a = byType[m.meetingType]) !== null && _a !== void 0 ? _a : 0) + 1;
            totalAttendees += m.attendees.length;
            totalPresent += m.attendees.filter((a) => a.status === 'present').length;
            capaFromMeetings += m.correctiveLinks.length;
            if (m.qualityScore != null) {
                avgQuality += m.qualityScore;
                qualityCount++;
            }
        }
        return {
            meetingCount: meetings.length,
            byType,
            attendanceRate: totalAttendees > 0 ? totalPresent / totalAttendees : 0,
            capaFromMeetings,
            avgQualityScore: qualityCount ? avgQuality / qualityCount : null,
            leadingIndicators: {
                meetingsPerWeek: meetings.length / 4.3,
                capaPerMeeting: meetings.length > 0 ? capaFromMeetings / meetings.length : 0,
            },
        };
    }
};
exports.PmSafetyMeetingsIntelligenceService = PmSafetyMeetingsIntelligenceService;
exports.PmSafetyMeetingsIntelligenceService = PmSafetyMeetingsIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmSafetyMeetingsIntelligenceService);
//# sourceMappingURL=pm-safety-meetings-intelligence.service.js.map