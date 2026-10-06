import { Module } from '@nestjs/common';
import { ChatChannelsController } from './chat-channels.controller';
import { ChatChannelsService } from './chat-channels.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatChannelsController],
  providers: [ChatChannelsService, PrismaService],
  exports: [ChatChannelsService],
})
export class ChatChannelsModule {}
