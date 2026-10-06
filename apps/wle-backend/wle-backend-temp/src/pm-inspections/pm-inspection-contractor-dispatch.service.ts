import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PmContractorDispatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import {
  INSPECTION_NOTIFICATION_TEMPLATES,
  type InspectionNotificationPayload,
} from './inspection-notification.templates';

@Injectable()
export class PmInspectionContractorDispatchService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  async dispatchForCorrectiveAction(
    correctiveActionId: string,
    actorId: number,
    clientSyncId?: string,
  ) {
    const action = await this.prisma.pmCorrectiveAction.findFirst({
      where: { id: correctiveActionId, deletedAt: null },
      include: {
        project: { select: { name: true } },
        attachments: true,
      },
    });
    if (!action) throw new NotFoundException('Corrective action not found');
    if (!action.subcontractorCompanyId) {
      throw new NotFoundException(
        'Corrective action has no subcontractor assigned',
      );
    }

    const finding = await this.prisma.pmInspectionPhotoFinding.findFirst({
      where: { correctiveActionId },
      include: { attachment: true, inspection: true },
    });

    const subcontractor = await this.prisma.company.findUnique({
      where: { id: action.subcontractorCompanyId },
      select: { id: true, name: true },
    });

    const packageJson = {
      correctiveActionId: action.id,
      title: action.title,
      description: action.description,
      severity: action.severityLevel,
      dueAt: action.dueAt?.toISOString(),
      evidenceRequirements: action.evidenceRequirementsJson,
      photos: [
        ...(finding?.attachment
          ? [
              {
                id: finding.attachment.id,
                dataUrl: finding.attachment.dataUrl,
                fileName: finding.attachment.fileName,
              },
            ]
          : []),
        ...action.attachments.map((a) => ({
          id: a.id,
          storageKey: a.storageKey,
          fileName: a.fileName,
        })),
      ],
      inspectionId: finding?.inspectionId ?? action.sourceId,
      dispatchedByUserId: actorId,
      dispatchedAt: new Date().toISOString(),
    };

    const existing = await this.prisma.pmInspectionContractorDispatch.findFirst(
      {
        where: {
          correctiveActionId,
          status: { notIn: ['cancelled', 'completed'] },
        },
      },
    );

    const dispatch = existing
      ? await this.prisma.pmInspectionContractorDispatch.update({
          where: { id: existing.id },
          data: {
            packageJson: packageJson as Prisma.InputJsonValue,
            status: PmContractorDispatchStatus.sent,
            sentAt: new Date(),
            overdueAt: action.dueAt,
          },
        })
      : await this.prisma.pmInspectionContractorDispatch.create({
          data: {
            correctiveActionId,
            subcontractorCompanyId: action.subcontractorCompanyId,
            status: PmContractorDispatchStatus.sent,
            packageJson: packageJson as Prisma.InputJsonValue,
            sentAt: new Date(),
            overdueAt: action.dueAt,
            clientSyncId,
          },
        });

    const notificationIds = await this.notifyContractorUsers(
      action.subcontractorCompanyId,
      INSPECTION_NOTIFICATION_TEMPLATES.contractorDispatchSent({
        inspectionId: finding?.inspectionId ?? action.sourceId,
        projectName: action.project?.name,
        findingTitle: action.title,
        severity: action.severityLevel,
        dueAt: action.dueAt?.toISOString(),
        correctiveActionId: action.id,
        dispatchId: dispatch.id,
        contractorName: subcontractor?.name ?? 'Contractor',
      }),
    );

    if (notificationIds.length) {
      await this.prisma.pmInspectionContractorDispatch.update({
        where: { id: dispatch.id },
        data: { notificationIds: notificationIds as Prisma.InputJsonValue },
      });
    }

    await this.prisma.pmCorrectiveAction.update({
      where: { id: action.id },
      data: { status: 'assigned' },
    });

    this.eventBus?.emit({
      name: DomainEvent.CONTRACTOR_DISPATCH_SENT,
      occurredAt: new Date().toISOString(),
      actorId,
      companyId: action.companyId,
      projectId: action.projectId ?? undefined,
      entityType: 'contractor_dispatch',
      entityId: dispatch.id,
      data: {
        correctiveActionId: action.id,
        subcontractorCompanyId: action.subcontractorCompanyId,
      },
    });

    return { dispatch, package: packageJson };
  }

  async acknowledge(dispatchId: string, userId: number) {
    const row = await this.prisma.pmInspectionContractorDispatch.update({
      where: { id: dispatchId },
      data: {
        status: PmContractorDispatchStatus.acknowledged,
        acknowledgedAt: new Date(),
      },
    });
    await this.prisma.pmCorrectiveActionAuditLog.create({
      data: {
        actionId: row.correctiveActionId,
        eventType: 'contractor.acknowledged',
        actorId: userId,
        payload: { dispatchId },
      },
    });
    return row;
  }

  async complete(
    dispatchId: string,
    userId: number,
    proof?: {
      storageKey?: string;
      dataUrl?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    const dispatch =
      await this.prisma.pmInspectionContractorDispatch.findUnique({
        where: { id: dispatchId },
        include: {
          correctiveAction: {
            include: { project: { select: { name: true } } },
          },
        },
      });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const finding = await this.prisma.pmInspectionPhotoFinding.findFirst({
      where: { correctiveActionId: dispatch.correctiveActionId },
      include: {
        attachment: true,
        inspection: {
          select: {
            id: true,
            inspectorUserId: true,
            title: true,
            projectId: true,
            companyId: true,
          },
        },
      },
    });

    const row = await this.prisma.pmInspectionContractorDispatch.update({
      where: { id: dispatchId },
      data: {
        status: PmContractorDispatchStatus.completed,
        completedAt: new Date(),
        packageJson: {
          ...(dispatch.packageJson as Record<string, unknown>),
          completionNotes: proof?.notes,
          completedByUserId: userId,
        } as Prisma.InputJsonValue,
      },
      include: { correctiveAction: true },
    });

    if (proof?.storageKey || proof?.dataUrl) {
      await this.prisma.pmCorrectiveActionAttachment.create({
        data: {
          actionId: row.correctiveActionId,
          storageKey: proof.storageKey,
          dataUrl: proof.dataUrl,
          fileName: proof.fileName ?? 'contractor_completion_proof.jpg',
          mimeType: proof.mimeType ?? 'image/jpeg',
          phase: 'completion_proof',
        },
      });
    }

    if (finding?.inspection && finding.attachment && proof?.dataUrl) {
      await this.prisma.pmInspectionAttachment.create({
        data: {
          inspectionId: finding.inspection.id,
          dataUrl: proof.dataUrl,
          fileName: proof.fileName ?? 'correction-proof.jpg',
          mimeType: proof.mimeType ?? 'image/jpeg',
          annotationJson: {
            kind: 'correction_proof',
            originalAttachmentId: finding.attachment.id,
            dispatchId,
            correctiveActionId: row.correctiveActionId,
            submittedByUserId: userId,
            notes: proof.notes,
          } as Prisma.InputJsonValue,
        },
      });

      await this.prisma.pmInspectionAuditLog.create({
        data: {
          inspectionId: finding.inspection.id,
          eventType: 'correction_proof_received',
          actorId: userId,
          payload: {
            dispatchId,
            originalAttachmentId: finding.attachment.id,
            correctiveActionId: row.correctiveActionId,
          } as Prisma.InputJsonValue,
        },
      });

      const inspector = await this.prisma.user.findUnique({
        where: { id: finding.inspection.inspectorUserId },
        select: { id: true, username: true, email: true },
      });

      if (inspector && this.notifications) {
        await this.notifications.notifyUsers({
          userIds: [inspector.id],
          type: INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
            inspectionId: finding.inspection.id,
            projectName: dispatch.correctiveAction.project?.name,
            findingTitle: row.correctiveAction.title,
            severity: row.correctiveAction.severityLevel,
            correctiveActionId: row.correctiveActionId,
            dispatchId,
          }).type,
          title: INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
            inspectionId: finding.inspection.id,
            projectName: dispatch.correctiveAction.project?.name,
            findingTitle: row.correctiveAction.title,
            severity: row.correctiveAction.severityLevel,
            correctiveActionId: row.correctiveActionId,
            dispatchId,
          }).title,
          body: INSPECTION_NOTIFICATION_TEMPLATES.correctionProofReceived({
            inspectionId: finding.inspection.id,
            projectName: dispatch.correctiveAction.project?.name,
            findingTitle: row.correctiveAction.title,
            severity: row.correctiveAction.severityLevel,
            correctiveActionId: row.correctiveActionId,
            dispatchId,
          }).body,
          payload: {
            inspectionId: finding.inspection.id,
            dispatchId,
            correctiveActionId: row.correctiveActionId,
          },
          dedupeKey: `correction-proof:${dispatchId}`,
        });
      }
    }

    await this.prisma.pmCorrectiveAction.update({
      where: { id: row.correctiveActionId },
      data: { status: 'verification_pending' },
    });

    await this.prisma.pmCorrectiveActionAuditLog.create({
      data: {
        actionId: row.correctiveActionId,
        eventType: 'contractor.completed',
        actorId: userId,
        payload: {
          dispatchId,
          proof: { notes: proof?.notes, hasPhoto: !!proof?.dataUrl },
        },
      },
    });

    return row;
  }

  async listForContractorCompany(projectId: number, companyId: number) {
    return this.prisma.pmInspectionContractorDispatch.findMany({
      where: {
        subcontractorCompanyId: companyId,
        correctiveAction: { projectId },
        status: { not: 'cancelled' },
      },
      include: {
        correctiveAction: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueAt: true,
            severityLevel: true,
            sourceId: true,
          },
        },
        subcontractorCompany: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markOverdueDispatches() {
    const now = new Date();
    const overdue = await this.prisma.pmInspectionContractorDispatch.findMany({
      where: {
        status: { in: ['sent', 'acknowledged', 'in_progress'] },
        overdueAt: { lt: now },
      },
      include: {
        correctiveAction: { include: { project: { select: { name: true } } } },
        subcontractorCompany: { select: { id: true, name: true } },
      },
      take: 50,
    });

    for (const d of overdue) {
      await this.prisma.pmInspectionContractorDispatch.update({
        where: { id: d.id },
        data: { status: PmContractorDispatchStatus.overdue },
      });
      await this.notifyContractorUsers(
        d.subcontractorCompanyId,
        INSPECTION_NOTIFICATION_TEMPLATES.contractorDispatchOverdue({
          inspectionId: d.correctiveAction.sourceId,
          projectName: d.correctiveAction.project?.name,
          findingTitle: d.correctiveAction.title,
          severity: d.correctiveAction.severityLevel,
          correctiveActionId: d.correctiveActionId,
          dispatchId: d.id,
          contractorName: d.subcontractorCompany.name,
        }),
      );
    }
    return { marked: overdue.length };
  }

  private async notifyContractorUsers(
    companyId: number,
    template: {
      title: string;
      body: string;
      type: string;
      metadata:
        | Record<string, unknown>
        | (InspectionNotificationPayload & { contractorName?: string });
    },
  ): Promise<number[]> {
    if (!this.notifications) return [];

    const admins = await this.prisma.user.findMany({
      where: {
        companyId,
        role: {
          in: [
            'COMPANY_ADMIN',
            'SUPERVISOR',
            'PROJECT_MANAGER',
            'CONTRACTOR_ADMIN',
            'CONTRACTOR_USER',
          ],
        },
      },
      select: { id: true },
      take: 20,
    });
    if (!admins.length) return [];

    const result = await this.notifications.notifyUsers({
      userIds: admins.map((u) => u.id),
      type: template.type,
      title: template.title,
      body: template.body,
      payload: template.metadata as Record<string, unknown>,
      dedupeKey: `inspection-dispatch:${template.metadata?.dispatchId}`,
    });

    return result.created > 0 ? admins.map((u) => u.id) : [];
  }
}
