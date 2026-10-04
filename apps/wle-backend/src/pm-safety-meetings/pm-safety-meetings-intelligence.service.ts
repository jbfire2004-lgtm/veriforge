import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type MeetingQualityReport = {
  meetingId: string;
  qualityScore: number;
  engagementScore: number;
  factors: { name: string; impact: number; explanation: string }[];
  hazardPatterns: string[];
  weakControls: string[];
  correlations: {
    jhaIds: string[];
    inspectionIds: string[];
    incidentIds: string[];
    capaIds: string[];
  };
};

@Injectable()
export class PmSafetyMeetingsIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  async scoreMeeting(meetingId: string): Promise<MeetingQualityReport> {
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

    const factors: MeetingQualityReport['factors'] = [];
    let quality = 50;
    let engagement = 40;

    const present = meeting.attendees.filter((a) => a.status === 'present');
    const signRate =
      present.length > 0 ? meeting.signatures.length / present.length : 0;
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

    const hazards = (meeting.hazardsDiscussed as string[]) ?? [];
    const controls = (meeting.controlsDiscussed as string[]) ?? [];
    const hazardPatterns = [...new Set(hazards)].slice(0, 8);
    const weakControls: string[] = [];
    if (hazards.length > controls.length) {
      weakControls.push(
        'More hazards discussed than controls — verify adequate controls',
      );
      quality -= 15;
    }

    const correlations = await this.correlate(
      meeting.projectId,
      meeting.topics,
    );

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

  private async correlate(
    projectId: number,
    topics: { sourceModule: string | null; sourceId: string | null }[],
  ) {
    const jhaIds: string[] = [];
    const inspectionIds: string[] = [];
    const incidentIds: string[] = [];
    const capaIds: string[] = [];

    for (const t of topics) {
      if (!t.sourceModule || !t.sourceId) continue;
      if (t.sourceModule === 'jha_flha') jhaIds.push(t.sourceId);
      if (t.sourceModule === 'inspection') inspectionIds.push(t.sourceId);
      if (t.sourceModule === 'incident') incidentIds.push(t.sourceId);
    }

    const links = await this.prisma.safetyMeetingCorrectiveAction.findMany({
      where: { meeting: { projectId } },
      select: { correctiveActionId: true },
      take: 20,
    });
    capaIds.push(...links.map((l) => l.correctiveActionId));

    return { jhaIds, inspectionIds, incidentIds, capaIds };
  }

  async projectAnalytics(projectId: number) {
    const since30 = new Date(Date.now() - 30 * 86400000);
    const meetings = await this.prisma.safetyMeeting.findMany({
      where: { projectId, deletedAt: null, createdAt: { gte: since30 } },
      include: { attendees: true, correctiveLinks: true },
    });

    const byType: Record<string, number> = {};
    let totalAttendees = 0;
    let totalPresent = 0;
    let capaFromMeetings = 0;
    let avgQuality = 0;
    let qualityCount = 0;

    for (const m of meetings) {
      byType[m.meetingType] = (byType[m.meetingType] ?? 0) + 1;
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
        capaPerMeeting:
          meetings.length > 0 ? capaFromMeetings / meetings.length : 0,
      },
    };
  }
}
