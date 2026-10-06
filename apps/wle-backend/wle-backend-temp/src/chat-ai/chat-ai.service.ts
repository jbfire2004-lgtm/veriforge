import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatAIService {
  constructor(private prisma: PrismaService) {}

  async summarizeRoom(roomId: number) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    const text = messages.map((m) => m.content).join('\n');

    return {
      summary: `Summary of ${messages.length} messages:\n\n${text.slice(
        0,
        500,
      )}...`,
    };
  }
}
