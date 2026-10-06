import { Module } from '@nestjs/common';
import { ChatAIController } from './chat-ai.controller';
import { ChatAIService } from './chat-ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatAIController],
  providers: [ChatAIService, PrismaService],
  exports: [ChatAIService],
})
export class ChatAIModule {}
