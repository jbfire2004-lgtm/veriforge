import { Module } from '@nestjs/common';
import { ChatReactionsController } from './chat-reactions.controller';
import { ChatReactionsService } from './chat-reactions.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatReactionsController],
  providers: [ChatReactionsService, PrismaService],
  exports: [ChatReactionsService],
})
export class ChatReactionsModule {}
