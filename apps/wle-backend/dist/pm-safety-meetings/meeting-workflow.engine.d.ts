import { SafetyMeetingReviewStatus, SafetyMeetingStatus, SafetyMeetingType } from '@prisma/client';
export type MeetingWorkflowInput = {
    currentStatus: SafetyMeetingStatus;
    targetStatus: SafetyMeetingStatus;
    meetingType: SafetyMeetingType;
    hasHighRiskTopics: boolean;
    hasCorrectiveActions: boolean;
    hasSifTopics: boolean;
    attendeeCount: number;
    signedAttendeeCount: number;
    reviewStatus: SafetyMeetingReviewStatus;
};
export declare class MeetingWorkflowEngine {
    canTransition(input: MeetingWorkflowInput): {
        allowed: boolean;
        reason?: string;
    };
    requiresSupervisorReview(flags: {
        meetingType: SafetyMeetingType;
        hasHighRiskTopics: boolean;
        hasCorrectiveActions: boolean;
        hasSifTopics: boolean;
    }): boolean;
    deriveReviewStatus(requiresReview: boolean, current: SafetyMeetingReviewStatus): SafetyMeetingReviewStatus;
}
