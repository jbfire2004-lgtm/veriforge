import {
  SafetyMeetingReviewStatus,
  SafetyMeetingStatus,
  SafetyMeetingType,
} from '@prisma/client';
import {
  MEETING_STATUS_TRANSITIONS,
  REVIEW_REQUIRED_TYPES,
} from './pm-safety-meetings.constants';

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

export class MeetingWorkflowEngine {
  canTransition(input: MeetingWorkflowInput): {
    allowed: boolean;
    reason?: string;
  } {
    const allowed = MEETING_STATUS_TRANSITIONS[input.currentStatus] ?? [];
    if (!allowed.includes(input.targetStatus)) {
      return {
        allowed: false,
        reason: `Cannot transition from ${input.currentStatus} to ${input.targetStatus}`,
      };
    }

    if (input.targetStatus === 'completed') {
      if (input.attendeeCount === 0) {
        return { allowed: false, reason: 'At least one attendee required' };
      }
      if (input.signedAttendeeCount < input.attendeeCount) {
        return {
          allowed: false,
          reason: 'All present attendees must sign before completion',
        };
      }
    }

    if (input.targetStatus === 'locked') {
      const needsReview = this.requiresSupervisorReview({
        meetingType: input.meetingType,
        hasHighRiskTopics: input.hasHighRiskTopics,
        hasCorrectiveActions: input.hasCorrectiveActions,
        hasSifTopics: input.hasSifTopics,
      });
      if (
        needsReview &&
        input.reviewStatus !== 'approved' &&
        input.reviewStatus !== 'not_required'
      ) {
        return {
          allowed: false,
          reason: 'Supervisor review must be approved before locking',
        };
      }
    }

    return { allowed: true };
  }

  requiresSupervisorReview(flags: {
    meetingType: SafetyMeetingType;
    hasHighRiskTopics: boolean;
    hasCorrectiveActions: boolean;
    hasSifTopics: boolean;
  }): boolean {
    if (REVIEW_REQUIRED_TYPES.includes(flags.meetingType)) return true;
    if (flags.hasHighRiskTopics) return true;
    if (flags.hasCorrectiveActions) return true;
    if (flags.hasSifTopics) return true;
    return false;
  }

  deriveReviewStatus(
    requiresReview: boolean,
    current: SafetyMeetingReviewStatus,
  ): SafetyMeetingReviewStatus {
    if (!requiresReview) return 'not_required';
    if (current === 'not_required') return 'pending';
    return current;
  }
}
