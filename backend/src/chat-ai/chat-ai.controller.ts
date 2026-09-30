import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChatAIService } from './chat-ai.service';

@Controller('chat-ai')
export class ChatAIController {
  constructor(private readonly ai: ChatAIService) {}

  @Get('summary/:roomId')
  summarize(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.ai.summarizeRoom(roomId);
  }
}
