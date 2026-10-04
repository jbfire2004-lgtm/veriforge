import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatModerationService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: {
    roomId: number;
    userId: number;
    action: string;
    reason?: string;
  }) {
    return this.prisma.chatModerationEvent.create({ data });
  }

  async warn(roomId: number, userId: number, reason?: string) {
    return this.logAction({ roomId, userId, action: 'WARN', reason });
  }

  async mute(roomId: number, userId: number, reason?: string) {
    return this.logAction({ roomId, userId, action: 'MUTE', reason });
  }

  async ban(roomId: number, userId: number, reason?: string) {
    return this.logAction({ roomId, userId, action: 'BAN', reason });
  }

  async listEvents(roomId: number) {
    return this.prisma.chatModerationEvent.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
