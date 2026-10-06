import { Module } from '@nestjs/common';
import { ChatModerationController } from './chat-moderation.controller';
import { ChatModerationService } from './chat-moderation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatModerationController],
  providers: [ChatModerationService, PrismaService],
  exports: [ChatModerationService],
})
export class ChatModerationModule {}
