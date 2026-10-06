import { Module } from '@nestjs/common';
import { ChatThreadingController } from './chat-threading.controller';
import { ChatThreadingService } from './chat-threading.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatThreadingController],
  providers: [ChatThreadingService, PrismaService],
  exports: [ChatThreadingService],
})
export class ChatThreadingModule {}
