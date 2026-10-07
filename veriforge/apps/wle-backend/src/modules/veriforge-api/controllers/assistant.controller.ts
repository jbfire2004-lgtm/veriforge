import {
  Body,
  Controller,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { resolveUserId } from '../veriforge-request.util';
import {
  AssistantService,
  type AssistantAction,
} from '../services/assistant.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/assistant')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeAssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  ask(
    @Body() body: { message: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body);
    const response = this.assistantService.ask({
      message: body.message ?? '',
      userId,
    });
    return buildSuccess(response, {
      userId,
      forgeStatus: response.metadata.forgeStatus,
    });
  }

  @Post('action')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  action(
    @Body()
    body: {
      action: AssistantAction;
      payload?: Record<string, unknown>;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body);
    const result = this.assistantService.triggerAction({
      action: body.action,
      payload: body.payload,
      userId,
    });
    return buildSuccess(result, {
      userId,
      forgeStatus: result.metadata.forgeStatus,
    });
  }
}
