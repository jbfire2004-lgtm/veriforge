import { PrismaService } from '../prisma/prisma.service';
export type MeetingQualityReport = {
    meetingId: string;
    qualityScore: number;
    engagementScore: number;
    factors: {
        name: string;
        impact: number;
        explanation: string;
    }[];
    hazardPatterns: string[];
    weakControls: string[];
    correlations: {
        jhaIds: string[];
        inspectionIds: string[];
        incidentIds: string[];
        capaIds: string[];
    };
};
export declare class PmSafetyMeetingsIntelligenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    scoreMeeting(meetingId: string): Promise<MeetingQualityReport>;
    private correlate;
    projectAnalytics(projectId: number): Promise<{
        meetingCount: number;
        byType: Record<string, number>;
        attendanceRate: number;
        capaFromMeetings: number;
        avgQualityScore: number;
        leadingIndicators: {
            meetingsPerWeek: number;
            capaPerMeeting: number;
        };
    }>;
}
