import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatChannelsService {
  constructor(private prisma: PrismaService) {}

  async createChannel(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const room = await this.prisma.chatRoom.create({
      data: { type: 'GROUP', name },
    });

    return this.prisma.chatChannel.create({
      data: { name, slug, roomId: room.id },
      include: { room: true },
    });
  }

  async listChannels() {
    return this.prisma.chatChannel.findMany({
      include: { room: true },
      orderBy: { name: 'asc' },
    });
  }

  async getChannel(slug: string) {
    const channel = await this.prisma.chatChannel.findUnique({
      where: { slug },
      include: { room: true },
    });

    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }
}
