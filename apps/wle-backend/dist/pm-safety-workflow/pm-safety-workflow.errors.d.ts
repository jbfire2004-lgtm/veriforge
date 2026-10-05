import { BadRequestException } from '@nestjs/common';
import type { PmSafetyWorkflowStatus } from '@prisma/client';
import type { PmSafetyAction } from './pm-safety-workflow.types';
export declare const PM_SAFETY_ERROR: {
    readonly INVALID_TRANSITION: "PM_SAFETY_INVALID_TRANSITION";
    readonly ACTOR_FORBIDDEN: "PM_SAFETY_ACTOR_FORBIDDEN";
};
export declare function pmSafetyInvalidTransition(params: {
    status: PmSafetyWorkflowStatus;
    action: PmSafetyAction;
}): BadRequestException;
