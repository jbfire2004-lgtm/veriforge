import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatReactionsService {
  constructor(private prisma: PrismaService) {}

  async addReaction(messageId: number, userId: number, emoji: string) {
    return this.prisma.chatReaction.create({
      data: { messageId, userId, emoji },
    });
  }

  async removeReaction(messageId: number, userId: number, emoji: string) {
    return this.prisma.chatReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  }

  async listReactions(messageId: number) {
    return this.prisma.chatReaction.findMany({
      where: { messageId },
      include: { user: true },
    });
  }
}
