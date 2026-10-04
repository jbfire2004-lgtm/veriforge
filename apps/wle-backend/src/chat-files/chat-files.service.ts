import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatFilesService {
  constructor(private prisma: PrismaService) {}

  async attachFile(messageId: number, url: string, type: string) {
    return this.prisma.chatFile.create({
      data: { messageId, url, type },
    });
  }

  async getFiles(messageId: number) {
    return this.prisma.chatFile.findMany({
      where: { messageId },
    });
  }
}
