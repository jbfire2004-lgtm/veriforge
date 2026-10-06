import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatPushService {
  constructor(private prisma: PrismaService) {}

  async notifyUsers(userIds: number[], title: string, body: string) {
    for (const userId of userIds) {
      await this.prisma.notification.create({
        data: {
          userId,
          channel: 'PUSH',
          type: 'CHAT',
          payload: { title, body },
        },
      });
    }
  }

  async notifyMention(roomId: number, senderId: number, content: string) {
    const mentions = content.match(/@(\w+)/g) || [];
    if (mentions.length === 0) return;

    const usernames = mentions.map((m) => m.replace('@', ''));

    const users = await this.prisma.user.findMany({
      where: { username: { in: usernames } },
    });

    await this.notifyUsers(
      users.map((u) => u.id),
      'You were mentioned',
      content,
    );
  }
}
