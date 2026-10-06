import { Injectable, Optional } from '@nestjs/common';
import { PmContractorDispatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionContractorDispatchService } from '../pm-inspections/pm-inspection-contractor-dispatch.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import {
  PmContractorPortalAccessService,
  type PortalActor,
} from './pm-contractor-portal-access.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';

@Injectable()
export class PmContractorPortalInboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PmContractorPortalAccessService,
    private readonly dispatch: PmInspectionContractorDispatchService,
    private readonly capa: PmCorrectiveActionsService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
  ) {}

  async listInbox(
    actor: PortalActor,
    opts?: { status?: PmContractorDispatchStatus; overdueOnly?: boolean },
  ) {
    const contractorCompanyId = this.access.requireContractorCompany(actor);

    const dispatches =
      await this.prisma.pmInspectionContractorDispatch.findMany({
        where: {
          subcontractorCompanyId: contractorCompanyId,
          ...(opts?.status
            ? { status: opts.status }
            : { status: { notIn: ['cancelled'] } }),
          ...(opts?.overdueOnly
            ? {
                overdueAt: { lt: new Date() },
                status: {
                  in: ['sent', 'acknowledged', 'in_progress', 'overdue'],
                },
              }
            : {}),
        },
        include: {
          correctiveAction: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              severityLevel: true,
              dueAt: true,
              projectId: true,
              project: { select: { id: true, name: true } },
              attachments: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          },
          subcontractorCompany: { select: { id: true, name: true } },
        },
        orderBy: [{ overdueAt: 'asc' }, { sentAt: 'desc' }],
        take: 100,
      });

    const now = new Date();
    const summary = {
      total: dispatches.length,
      overdue: dispatches.filter(
        (d) =>
          d.overdueAt &&
          d.overdueAt < now &&
          !['completed', 'cancelled'].includes(d.status),
      ).length,
      pendingAck: dispatches.filter((d) => d.status === 'sent').length,
    };

    const capaIds = dispatches.map((d) => d.correctiveActionId);
    const riskContexts =
      capaIds.length > 0
        ? await this.prisma.pmSmsRiskContext.findMany({
            where: {
              entityType: 'corrective_action',
              entityId: { in: capaIds },
            },
          })
        : [];
    const riskByCapa = new Map(riskContexts.map((r) => [r.entityId, r]));

    const items = dispatches.map((d) => {
      const pkg = d.packageJson as {
        inspectionId?: string;
        photos?: Array<{ id?: string; dataUrl?: string; fileName?: string }>;
      } | null;
      return {
        ...d,
        inspectionId: pkg?.inspectionId ?? null,
        sourcePhotos: pkg?.photos ?? [],
        smsRiskContext: riskByCapa.get(d.correctiveActionId) ?? null,
      };
    });

    return { summary, items };
  }

  async acknowledgeDispatch(actor: PortalActor, dispatchId: string) {
    const row = await this.access.assertDispatchAccess(actor, dispatchId);
    const result = await this.dispatch.acknowledge(dispatchId, actor.userId);
    const capa = row.correctiveAction;
    this.ecosystem?.emitContractorPortalActivity({
      dispatchId,
      companyId: capa.companyId,
      projectId: capa.projectId ?? undefined,
      activity: 'acknowledged',
      actorId: actor.userId,
    });
    return result;
  }

  async uploadEvidence(
    actor: PortalActor,
    dispatchId: string,
    body: {
      dataUrl?: string;
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    const row = await this.access.assertDispatchAccess(actor, dispatchId);

    const attachment = await this.capa.addAttachment(
      row.correctiveActionId,
      {
        dataUrl: body.dataUrl,
        storageKey: body.storageKey,
        fileName: body.fileName ?? 'contractor_evidence',
        mimeType: body.mimeType ?? 'image/jpeg',
        phase: 'contractor_evidence',
      },
      actor.userId,
    );

    if (row.status === 'sent' || row.status === 'acknowledged') {
      await this.prisma.pmInspectionContractorDispatch.update({
        where: { id: dispatchId },
        data: { status: PmContractorDispatchStatus.in_progress },
      });
    }

    if (body.notes) {
      await this.prisma.pmCorrectiveActionAuditLog.create({
        data: {
          actionId: row.correctiveActionId,
          eventType: 'contractor.evidence_uploaded',
          actorId: actor.userId,
          payload: {
            dispatchId,
            notes: body.notes,
            attachmentId: attachment.id,
          } as Prisma.InputJsonValue,
        },
      });
    }

    return attachment;
  }

  async completeDispatch(
    actor: PortalActor,
    dispatchId: string,
    proof?: {
      storageKey?: string;
      dataUrl?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    const row = await this.access.assertDispatchAccess(actor, dispatchId);

    const result = await this.dispatch.complete(dispatchId, actor.userId, {
      storageKey: proof?.storageKey,
      dataUrl: proof?.dataUrl,
      fileName: proof?.fileName,
      mimeType: proof?.mimeType,
      notes: proof?.notes,
    });
    const action = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: row.correctiveActionId },
      select: { companyId: true, projectId: true },
    });
    if (action) {
      this.ecosystem?.emitContractorPortalActivity({
        dispatchId,
        companyId: action.companyId,
        projectId: action.projectId ?? undefined,
        activity: 'completed',
        actorId: actor.userId,
      });
      this.ecosystem?.emitCapaStatusChanged({
        actionId: row.correctiveActionId,
        companyId: action.companyId,
        projectId: action.projectId ?? undefined,
        status: 'verification_pending',
        actorId: actor.userId,
      });
    }
    return result;
  }
}
