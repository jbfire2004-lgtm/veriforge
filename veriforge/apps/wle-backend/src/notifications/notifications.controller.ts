import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notify: NotificationsService) {}

  @Post()
  send(
    @Body()
    body: {
      userId?: number;
      channel: 'EMAIL' | 'SMS' | 'PUSH';
      type: string;
      payload: any;
    },
  ) {
    return this.notify.send(body);
  }

  @Get()
  list() {
    return this.notify.listForUser(0);
  }

  @Get('user/:id')
  forUser(@Param('id', ParseIntPipe) id: number) {
    return this.notify.listForUser(id);
  }
}
