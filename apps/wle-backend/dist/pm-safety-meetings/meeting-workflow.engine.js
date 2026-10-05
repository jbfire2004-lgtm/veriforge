"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingWorkflowEngine = void 0;
const pm_safety_meetings_constants_1 = require("./pm-safety-meetings.constants");
class MeetingWorkflowEngine {
    canTransition(input) {
        var _a;
        const allowed = (_a = pm_safety_meetings_constants_1.MEETING_STATUS_TRANSITIONS[input.currentStatus]) !== null && _a !== void 0 ? _a : [];
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
            if (needsReview &&
                input.reviewStatus !== 'approved' &&
                input.reviewStatus !== 'not_required') {
                return {
                    allowed: false,
                    reason: 'Supervisor review must be approved before locking',
                };
            }
        }
        return { allowed: true };
    }
    requiresSupervisorReview(flags) {
        if (pm_safety_meetings_constants_1.REVIEW_REQUIRED_TYPES.includes(flags.meetingType))
            return true;
        if (flags.hasHighRiskTopics)
            return true;
        if (flags.hasCorrectiveActions)
            return true;
        if (flags.hasSifTopics)
            return true;
        return false;
    }
    deriveReviewStatus(requiresReview, current) {
        if (!requiresReview)
            return 'not_required';
        if (current === 'not_required')
            return 'pending';
        return current;
    }
}
exports.MeetingWorkflowEngine = MeetingWorkflowEngine;
//# sourceMappingURL=meeting-workflow.engine.js.map