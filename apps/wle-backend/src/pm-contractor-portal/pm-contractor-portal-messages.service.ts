import { ForbiddenException, Injectable, Optional } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CONTRACTOR_ROLES,
  PmContractorPortalAccessService,
  PRIME_PORTAL_ROLES,
  type PortalActor,
} from './pm-contractor-portal-access.service';
import { contractorPortalMessageReceived } from './contractor-portal-notification.templates';

@Injectable()
export class PmContractorPortalMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PmContractorPortalAccessService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  async listThreads(
    actor: PortalActor,
    opts?: { primeCompanyId?: number; projectId?: number },
  ) {
    if (this.access.isContractorRole(actor.role)) {
      const contractorCompanyId = this.access.requireContractorCompany(actor);
      const where = {
        contractorCompanyId,
        ...(opts?.primeCompanyId
          ? { primeCompanyId: opts.primeCompanyId }
          : {}),
        ...(opts?.projectId ? { projectId: opts.projectId } : {}),
      };

      const messages = await this.prisma.pmContractorPortalMessage.findMany({
        where,
        include: {
          sender: { select: { id: true, username: true, role: true } },
          primeCompany: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return { messages };
    }

    if (!PRIME_PORTAL_ROLES.includes(actor.role) || !actor.companyId) {
      throw new ForbiddenException('Insufficient permissions for messaging');
    }

    const messages = await this.prisma.pmContractorPortalMessage.findMany({
      where: {
        primeCompanyId: actor.companyId,
        ...(opts?.primeCompanyId
          ? { contractorCompanyId: opts.primeCompanyId }
          : {}),
      },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        contractorCompany: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { messages };
  }

  async sendMessage(
    actor: PortalActor,
    body: {
      primeCompanyId: number;
      contractorCompanyId: number;
      projectId?: number;
      text: string;
      relatedType?: string;
      relatedId?: string;
    },
  ) {
    const isContractor = CONTRACTOR_ROLES.includes(actor.role);
    const isPrime = PRIME_PORTAL_ROLES.includes(actor.role);

    if (!isContractor && !isPrime) {
      throw new ForbiddenException('Cannot send portal messages');
    }

    if (isContractor) {
      const contractorCompanyId = this.access.requireContractorCompany(actor);
      if (body.contractorCompanyId !== contractorCompanyId) {
        throw new ForbiddenException('Invalid contractor company');
      }
    } else if (!actor.companyId || body.primeCompanyId !== actor.companyId) {
      throw new ForbiddenException('Invalid prime company');
    }

    await this.access.assertMembership(
      body.primeCompanyId,
      body.contractorCompanyId,
      body.projectId,
    );

    const message = await this.prisma.pmContractorPortalMessage.create({
      data: {
        primeCompanyId: body.primeCompanyId,
        contractorCompanyId: body.contractorCompanyId,
        projectId: body.projectId,
        senderUserId: actor.userId,
        body: body.text,
        relatedType: body.relatedType,
        relatedId: body.relatedId,
      },
      include: {
        sender: { select: { id: true, username: true } },
        primeCompany: { select: { id: true, name: true } },
      },
    });

    await this.notifyRecipients(
      actor,
      message.primeCompany.name,
      message.id,
      body,
    );

    return message;
  }

  async markRead(actor: PortalActor, messageId: string) {
    const message = await this.prisma.pmContractorPortalMessage.findUnique({
      where: { id: messageId },
    });
    if (!message) return null;

    if (this.access.isContractorRole(actor.role)) {
      this.access.requireContractorCompany(actor);
      if (message.contractorCompanyId !== actor.companyId) {
        throw new ForbiddenException('Cannot read this message');
      }
    } else if (!actor.companyId || message.primeCompanyId !== actor.companyId) {
      throw new ForbiddenException('Cannot read this message');
    }

    return this.prisma.pmContractorPortalMessage.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  }

  private async notifyRecipients(
    actor: PortalActor,
    primeName: string,
    messageId: string,
    body: { primeCompanyId: number; contractorCompanyId: number; text: string },
  ) {
    if (!this.notifications) return;

    const isContractor = CONTRACTOR_ROLES.includes(actor.role);
    const template = contractorPortalMessageReceived({
      primeName,
      preview: body.text,
      messageId,
      primeCompanyId: body.primeCompanyId,
    });

    const userIds = isContractor
      ? await this.primeRecipientIds(body.primeCompanyId)
      : await this.contractorRecipientIds(body.contractorCompanyId);

    if (!userIds.length) return;

    await this.notifications.notifyUsers({
      userIds,
      type: template.type,
      title: template.title,
      body: template.body,
      payload: template.metadata,
    });
  }

  private async contractorRecipientIds(companyId: number) {
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        role: {
          in: [
            UserRole.CONTRACTOR_ADMIN,
            UserRole.CONTRACTOR_USER,
            UserRole.COMPANY_ADMIN,
          ],
        },
      },
      select: { id: true },
      take: 25,
    });
    return users.map((u) => u.id);
  }

  private async primeRecipientIds(companyId: number) {
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        role: { in: PRIME_PORTAL_ROLES },
      },
      select: { id: true },
      take: 25,
    });
    return users.map((u) => u.id);
  }
}
