import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatNotificationsService {
  constructor(private prisma: PrismaService) {}

  async notifyRoomMembers(roomId: number, senderId: number, message: string) {
    const members = await this.prisma.chatMember.findMany({
      where: { roomId, userId: { not: senderId } },
      include: { user: true },
    });

    for (const m of members) {
      await this.prisma.notification.create({
        data: {
          userId: m.userId,
          channel: 'PUSH',
          type: 'CHAT_MESSAGE',
          payload: {
            title: 'New Message',
            body: message,
          },
        },
      });
    }
  }
}
