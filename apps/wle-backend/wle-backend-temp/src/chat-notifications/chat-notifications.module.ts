import { Module } from '@nestjs/common';
import { ChatNotificationsService } from './chat-notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ChatNotificationsService, PrismaService],
  exports: [ChatNotificationsService],
})
export class ChatNotificationsModule {}
