import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  NotificationsService,
  UpdateNotificationPreferencesInput,
} from '../../notifications/notifications.service';
import { COMPANY_ADMIN_ROLES, STAFF_ROLES } from '../vera-core/roles';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { RunSchedulerQueryDto } from './dto/notification-engine.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/notifications`)
export class NotificationEngineController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly scheduler: NotificationSchedulerService,
  ) {}

  @Get()
  @Roles(...STAFF_ROLES)
  list(
    @Req() req: { user: { id: number } },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifications.listForUser(req.user.id, {
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @Roles(...STAFF_ROLES)
  unreadCount(@Req() req: { user: { id: number } }) {
    return this.notifications
      .unreadCount(req.user.id)
      .then((count) => ({ count }));
  }

  @Patch(':id/read')
  @Roles(...STAFF_ROLES)
  markRead(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notifications.markRead(req.user.id, id);
  }

  @Post('read-all')
  @Roles(...STAFF_ROLES)
  @HttpCode(HttpStatus.OK)
  markAllRead(@Req() req: { user: { id: number } }) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Get('settings')
  @Roles(...STAFF_ROLES)
  getSettings(@Req() req: { user: { id: number } }) {
    return this.notifications.getOrCreatePreferences(req.user.id);
  }

  @Patch('settings')
  @Roles(...STAFF_ROLES)
  updateSettings(
    @Req() req: { user: { id: number } },
    @Body() body: UpdateNotificationPreferencesInput,
  ) {
    return this.notifications.updatePreferences(req.user.id, body);
  }

  @Post('scheduler/run')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  runScheduler(@Query() query: RunSchedulerQueryDto) {
    return this.scheduler.runAll(query.companyId);
  }

  @Post('test')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  testSend(
    @Req() req: { user: { id: number } },
    @Body() body: { title?: string; body?: string },
  ) {
    return this.notifications.notifyUsers({
      userIds: [req.user.id],
      type: 'TEST',
      title: body.title ?? 'Test notification',
      body: body.body ?? 'This is a test from VERA.',
      payload: { test: true },
    });
  }
}
