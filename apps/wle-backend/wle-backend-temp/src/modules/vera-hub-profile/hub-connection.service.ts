import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HubConnectionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HubConnectionService {
  constructor(private readonly prisma: PrismaService) {}

  async requestConnection(
    requesterUserId: number,
    addresseeUserId: number,
    message?: string,
  ) {
    if (requesterUserId === addresseeUserId) {
      throw new BadRequestException('Cannot connect with yourself');
    }

    const addressee = await this.prisma.user.findUnique({
      where: { id: addresseeUserId },
    });
    if (!addressee) throw new NotFoundException('User not found');

    const existing = await this.prisma.hubConnection.findFirst({
      where: {
        OR: [
          { requesterUserId, addresseeUserId },
          {
            requesterUserId: addresseeUserId,
            addresseeUserId: requesterUserId,
          },
        ],
      },
    });

    if (existing?.status === HubConnectionStatus.ACCEPTED) {
      throw new ConflictException('Already connected');
    }
    if (existing?.status === HubConnectionStatus.PENDING) {
      throw new ConflictException('Connection request already pending');
    }

    return this.prisma.hubConnection.create({
      data: {
        requesterUserId,
        addresseeUserId,
        message: message?.trim() || null,
        status: HubConnectionStatus.PENDING,
      },
    });
  }

  async acceptConnection(connectionId: string, userId: number) {
    const row = await this.prisma.hubConnection.findUnique({
      where: { id: connectionId },
    });
    if (!row || row.addresseeUserId !== userId) {
      throw new NotFoundException('Connection request not found');
    }
    return this.prisma.hubConnection.update({
      where: { id: connectionId },
      data: { status: HubConnectionStatus.ACCEPTED, respondedAt: new Date() },
    });
  }

  async declineConnection(connectionId: string, userId: number) {
    const row = await this.prisma.hubConnection.findUnique({
      where: { id: connectionId },
    });
    if (!row || row.addresseeUserId !== userId) {
      throw new NotFoundException('Connection request not found');
    }
    return this.prisma.hubConnection.update({
      where: { id: connectionId },
      data: { status: HubConnectionStatus.DECLINED, respondedAt: new Date() },
    });
  }

  async listConnections(userId: number) {
    const rows = await this.prisma.hubConnection.findMany({
      where: {
        status: HubConnectionStatus.ACCEPTED,
        OR: [{ requesterUserId: userId }, { addresseeUserId: userId }],
      },
      orderBy: { respondedAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      userId:
        r.requesterUserId === userId ? r.addresseeUserId : r.requesterUserId,
      since: r.respondedAt?.toISOString() ?? r.createdAt.toISOString(),
    }));
  }
}
