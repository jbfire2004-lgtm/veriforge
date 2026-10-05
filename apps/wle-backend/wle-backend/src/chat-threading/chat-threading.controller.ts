import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatThreadingService } from './chat-threading.service';

@Controller('chat-threading')
export class ChatThreadingController {
  constructor(private readonly threads: ChatThreadingService) {}

  @Post()
  reply(
    @Body()
    body: {
      parentId: number;
      messageId: number;
    },
  ) {
    return this.threads.replyToMessage(body.parentId, body.messageId);
  }

  @Get(':parentId')
  getThread(@Param('parentId', ParseIntPipe) parentId: number) {
    return this.threads.getThread(parentId);
  }
}
