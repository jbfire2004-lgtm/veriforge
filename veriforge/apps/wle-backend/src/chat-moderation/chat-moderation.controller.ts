import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatModerationService } from './chat-moderation.service';

@Controller('chat-moderation')
export class ChatModerationController {
  constructor(private readonly mod: ChatModerationService) {}

  @Post('warn')
  warn(@Body() body: { roomId: number; userId: number; reason?: string }) {
    return this.mod.warn(body.roomId, body.userId, body.reason);
  }

  @Post('mute')
  mute(@Body() body: { roomId: number; userId: number; reason?: string }) {
    return this.mod.mute(body.roomId, body.userId, body.reason);
  }

  @Post('ban')
  ban(@Body() body: { roomId: number; userId: number; reason?: string }) {
    return this.mod.ban(body.roomId, body.userId, body.reason);
  }

  @Get('room/:roomId')
  events(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.mod.listEvents(roomId);
  }
}
