import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatThreadingService {
  constructor(private prisma: PrismaService) {}

  async replyToMessage(parentId: number, messageId: number) {
    return this.prisma.chatThread.create({
      data: { parentId, messageId },
    });
  }

  async getThread(parentId: number) {
    return this.prisma.chatThread.findMany({
      where: { parentId },
      include: {
        message: {
          include: { sender: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
