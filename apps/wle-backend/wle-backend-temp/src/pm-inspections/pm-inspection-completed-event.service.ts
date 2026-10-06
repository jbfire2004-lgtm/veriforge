import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import type { InspectionScoreResult } from './inspection-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { criticalMarkedFailedItemIds } from './pm-inspection-critical-findings';
import {
  INSPECTION_COMPLETED_AUDIT_EVENT,
  type InspectionCompletedCriticalFlag,
  type InspectionCompletedEventData,
  type InspectionCompletedFindingPayload,
  type InspectionCompletedFindingsSummary,
  type InspectionCompletedSignaturePayload,
} from './pm-inspection-completed-event.types';

type SignatureRow = {
  role: string;
  signerName: string | null;
  signedAt: Date;
  coreFileId: number | null;
};

@Injectable()
export class PmInspectionCompletedEventService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  async hasAlreadyEmitted(inspectionId: string): Promise<boolean> {
    const row = await this.prisma.pmInspectionAuditLog.findFirst({
      where: { inspectionId, eventType: INSPECTION_COMPLETED_AUDIT_EVENT },
      select: { id: true },
    });
    return Boolean(row);
  }

  buildCriticalFlags(
    checklistItems: ChecklistItemDef[],
    failedItemIds: string[],
  ): InspectionCompletedCriticalFlag[] {
    const failedCriticalIds = new Set(
      criticalMarkedFailedItemIds(checklistItems, failedItemIds),
    );
    return checklistItems
      .filter((item) => failedCriticalIds.has(item.id))
      .map((item) => ({
        itemId: item.id,
        label: item.label,
        failed: true as const,
      }));
  }

  buildFindingsSummary(
    findings: InspectionCompletedFindingPayload[],
    criticalFlags: InspectionCompletedCriticalFlag[],
  ): InspectionCompletedFindingsSummary {
    const deficiencies = findings.filter((row) => row.kind === 'deficiency');
    const photoFindings = findings.filter(
      (row) => row.kind === 'photo_finding',
    );
    return {
      deficiencyCount: deficiencies.length,
      photoFindingCount: photoFindings.length,
      criticalDeficiencyCount: deficiencies.filter(
        (row) => row.severity === 'critical',
      ).length,
      criticalFailedItemCount: criticalFlags.length,
    };
  }

  buildEventData(input: {
    inspectionId: string;
    score: InspectionScoreResult;
    signatures: SignatureRow[];
    checklistItems: ChecklistItemDef[];
    deficiencies: Array<{
      id: string;
      itemId: string;
      title: string;
      severity: string;
      category: string | null;
    }>;
    photoFindings: Array<{
      id: string;
      title: string;
      severity: string;
      category: string;
    }>;
  }): InspectionCompletedEventData {
    const findings = buildFindings(input.deficiencies, input.photoFindings);
    const signatures = buildSignatures(input.signatures);
    const criticalFlags = this.buildCriticalFlags(
      input.checklistItems,
      input.score.failedItemIds,
    );
    const findingsSummary = this.buildFindingsSummary(findings, criticalFlags);

    return {
      inspectionId: input.inspectionId,
      score: {
        scorePercent: input.score.scorePercent,
        passed: input.score.passed,
        riskScore: input.score.riskScore,
        requiresSupervisorReview: input.score.requiresSupervisorReview,
        failedItemCount: input.score.failedItemIds.length,
      },
      findings,
      signatures,
      signaturesPresent: signatures.length > 0,
      findingsSummary,
      criticalFlags,
    };
  }

  async emitOnceOnSubmit(input: {
    inspectionId: string;
    companyId: number;
    projectId: number;
    actorId: number;
    score: InspectionScoreResult;
    signatures: SignatureRow[];
    checklistItems: ChecklistItemDef[];
  }): Promise<{ emitted: boolean; data?: InspectionCompletedEventData }> {
    if (await this.hasAlreadyEmitted(input.inspectionId)) {
      return { emitted: false };
    }

    const [deficiencies, photoFindings] = await Promise.all([
      this.prisma.pmInspectionDeficiency.findMany({
        where: { inspectionId: input.inspectionId },
        select: {
          id: true,
          itemId: true,
          title: true,
          severity: true,
          category: true,
        },
      }),
      this.prisma.pmInspectionPhotoFinding.findMany({
        where: { inspectionId: input.inspectionId },
        select: {
          id: true,
          title: true,
          severity: true,
          category: true,
        },
      }),
    ]);

    const data = this.buildEventData({
      inspectionId: input.inspectionId,
      score: input.score,
      signatures: input.signatures,
      checklistItems: input.checklistItems,
      deficiencies,
      photoFindings,
    });

    if (this.eventBus) {
      this.eventBus.emit({
        name: DomainEvent.INSPECTION_COMPLETED,
        occurredAt: new Date().toISOString(),
        actorId: input.actorId,
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'pm_inspection',
        entityId: input.inspectionId,
        data: {
          ...data,
          source: 'checklist_submit',
          checklistSubmit: true,
          passed: data.score.passed,
          scorePercent: data.score.scorePercent,
          failedItemCount: data.score.failedItemCount,
          requiresSupervisorReview: data.score.requiresSupervisorReview,
        } as unknown as Record<string, unknown>,
      });
    }

    await this.prisma.pmInspectionAuditLog.create({
      data: {
        inspectionId: input.inspectionId,
        eventType: INSPECTION_COMPLETED_AUDIT_EVENT,
        actorId: input.actorId,
        payload: {
          source: 'checklist_submit',
          scorePercent: data.score.scorePercent,
          passed: data.score.passed,
          findingCount: data.findings.length,
          signatureCount: data.signatures.length,
          signaturesPresent: data.signaturesPresent,
          criticalFailedItemCount: data.findingsSummary.criticalFailedItemCount,
          criticalFlags: data.criticalFlags,
        } as Prisma.InputJsonValue,
      },
    });

    return { emitted: true, data };
  }
}

export function buildFindings(
  deficiencies: Array<{
    id: string;
    itemId: string;
    title: string;
    severity: string;
    category: string | null;
  }>,
  photoFindings: Array<{
    id: string;
    title: string;
    severity: string;
    category: string;
  }>,
): InspectionCompletedFindingPayload[] {
  const deficiencyRows: InspectionCompletedFindingPayload[] = deficiencies.map(
    (row) => ({
      kind: 'deficiency',
      id: row.id,
      title: row.title,
      severity: row.severity,
      itemId: row.itemId,
      category: row.category ?? undefined,
    }),
  );

  const photoRows: InspectionCompletedFindingPayload[] = photoFindings.map(
    (row) => ({
      kind: 'photo_finding',
      id: row.id,
      title: row.title,
      severity: row.severity,
      category: row.category,
    }),
  );

  return [...deficiencyRows, ...photoRows];
}

export function buildSignatures(
  signatures: SignatureRow[],
): InspectionCompletedSignaturePayload[] {
  return signatures.map((row) => ({
    role: row.role,
    signerName: row.signerName,
    signedAt: row.signedAt.toISOString(),
    coreFileId: row.coreFileId,
  }));
}
