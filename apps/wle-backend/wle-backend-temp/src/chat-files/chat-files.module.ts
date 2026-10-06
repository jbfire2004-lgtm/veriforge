import { Module } from '@nestjs/common';
import { ChatFilesController } from './chat-files.controller';
import { ChatFilesService } from './chat-files.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChatFilesController],
  providers: [ChatFilesService, PrismaService],
  exports: [ChatFilesService],
})
export class ChatFilesModule {}
