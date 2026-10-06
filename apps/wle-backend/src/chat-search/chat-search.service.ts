import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatSearchService {
  constructor(private prisma: PrismaService) {}

  async search(userId: number, query: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
        room: {
          members: { some: { userId } },
        },
      },
      include: {
        sender: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
