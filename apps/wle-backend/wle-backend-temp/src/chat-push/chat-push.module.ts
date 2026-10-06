import { Module } from '@nestjs/common';
import { ChatPushService } from './chat-push.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ChatPushService, PrismaService],
  exports: [ChatPushService],
})
export class ChatPushModule {}
