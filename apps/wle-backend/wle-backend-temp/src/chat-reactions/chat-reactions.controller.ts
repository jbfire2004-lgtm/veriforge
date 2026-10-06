import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatReactionsService } from './chat-reactions.service';

@Controller('chat-reactions')
export class ChatReactionsController {
  constructor(private readonly reactions: ChatReactionsService) {}

  @Post()
  add(@Body() body: { messageId: number; userId: number; emoji: string }) {
    return this.reactions.addReaction(body.messageId, body.userId, body.emoji);
  }

  @Delete()
  remove(@Body() body: { messageId: number; userId: number; emoji: string }) {
    return this.reactions.removeReaction(
      body.messageId,
      body.userId,
      body.emoji,
    );
  }

  @Get(':messageId')
  list(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.reactions.listReactions(messageId);
  }
}
