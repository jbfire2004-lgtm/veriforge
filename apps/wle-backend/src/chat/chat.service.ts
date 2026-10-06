import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // CREATE OR GET DIRECT CHAT ROOM
  // ---------------------------------------------------------
  async getOrCreateDirectRoom(userA: number, userB: number) {
    let room = await this.prisma.chatRoom.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          some: { userId: userA },
        },
      },
      include: { members: true },
    });

    if (room && room.members.some((m) => m.userId === userB)) {
      return room;
    }

    room = await this.prisma.chatRoom.create({
      data: {
        type: 'DIRECT',
        members: {
          create: [{ userId: userA }, { userId: userB }],
        },
      },
      include: { members: true },
    });

    return room;
  }

  // ---------------------------------------------------------
  // CREATE GROUP ROOM
  // ---------------------------------------------------------
  async createGroupRoom(name: string, memberIds: number[]) {
    return this.prisma.chatRoom.create({
      data: {
        name,
        type: 'GROUP',
        members: {
          create: memberIds.map((id) => ({ userId: id })),
        },
      },
      include: { members: true },
    });
  }

  // ---------------------------------------------------------
  // SEND MESSAGE
  // ---------------------------------------------------------
  async sendMessage(roomId: number, senderId: number, content: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('Chat room not found');

    return this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        readBy: [],
      },
      include: { sender: true },
    });
  }

  // ---------------------------------------------------------
  // GET MESSAGES
  // ---------------------------------------------------------
  async getMessages(roomId: number) {
    return this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
  }

  // ---------------------------------------------------------
  // MARK MESSAGE AS READ
  // ---------------------------------------------------------
  async markRead(messageId: number, userId: number) {
    const msg = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    if (!msg) throw new NotFoundException('Message not found');

    const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];

    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { readBy },
    });
  }

  // ---------------------------------------------------------
  // LIST ROOMS FOR USER
  // ---------------------------------------------------------
  async listRooms(userId: number) {
    return this.prisma.chatRoom.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: { include: { user: true } },
      },
    });
  }
}
