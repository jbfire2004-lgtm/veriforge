import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { buildSuccess } from '../veriforge-response';
import { resolveUserId } from '../veriforge-request.util';
import { NotificationService } from '../services/notification.service';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/notifications')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('queue')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.NOTIFICATIONS_MANAGE)
  listQueue(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.notificationService.listQueue(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('manage')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.NOTIFICATIONS_MANAGE)
  manage(
    @Body()
    body: {
      title: string;
      message: string;
      category: string;
      forgeStatus?: 'pending' | 'forged' | 'verified' | 'failed';
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.notificationService.enqueue(body), {
      userId: resolveUserId(req, body),
      forgeStatus: body.forgeStatus ?? 'forged',
    });
  }
}
