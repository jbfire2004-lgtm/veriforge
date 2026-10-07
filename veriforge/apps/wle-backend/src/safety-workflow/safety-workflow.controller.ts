import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { SafetyWorkflowService } from './safety-workflow.service';
import { IncidentStatus } from './safety-workflow.types';

@Controller('safety-workflow')
export class SafetyWorkflowController {
  constructor(private readonly workflow: SafetyWorkflowService) {}

  /** Workflow diagram metadata (steps, allowed transitions, guardrails). */
  @Get()
  definition() {
    return this.workflow.getDefinition();
  }

  /** Current phase, available next statuses, and investigation summary. */
  @Get('incidents/:id')
  incidentState(@Param('id', ParseIntPipe) id: number) {
    return this.workflow.getIncidentState(id);
  }

  /**
   * Apply a valid status transition. Body: { status, startInvestigation?, investigatorId? }
   */
  @Post('incidents/:id/advance')
  advance(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      status: IncidentStatus;
      startInvestigation?: boolean;
      investigatorId?: number;
    },
  ) {
    return this.workflow.advance(id, body.status, {
      startInvestigation: body.startInvestigation,
      investigatorId: body.investigatorId,
    });
  }
}
