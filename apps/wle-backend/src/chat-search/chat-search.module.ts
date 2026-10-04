import { Module } from '@nestjs/common';
import { ChatSearchController } from './chat-search.controller';
import { ChatSearchService } from './chat-search.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatSearchController],
  providers: [ChatSearchService, PrismaService],
  exports: [ChatSearchService],
})
export class ChatSearchModule {}
