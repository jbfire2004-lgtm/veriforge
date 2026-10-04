import { Injectable, Optional } from '@nestjs/common';
import {
  PmSubstanceTestResultOutcome,
  PmSubstanceTestType,
  PmWorkerMedicalRestrictionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SUBSTANCE_TEST_NOTIFICATION_TEMPLATES } from './substance-testing-notification.templates';

@Injectable()
export class PmSubstanceTestingComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  async applyResultCompliance(input: {
    testEventId: string;
    workerId: number;
    companyId: number;
    projectId?: number;
    outcome: PmSubstanceTestResultOutcome;
    testType: PmSubstanceTestType;
    actorId: number;
    workerName: string;
    projectName?: string;
  }) {
    const actions: Record<string, unknown> = {};

    if (input.outcome === 'negative') {
      await this.clearSubstanceAccessBlock(
        input.workerId,
        input.companyId,
        input.projectId,
      );
      actions.accessCleared = true;
      return actions;
    }

    const blocksWork =
      input.outcome === 'non_negative' ||
      input.outcome === 'refusal' ||
      input.outcome === 'tampered';

    if (blocksWork) {
      const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
        where: { workerId: input.workerId },
      });

      const restriction = await this.prisma.pmWorkerMedicalRestriction.create({
        data: {
          workerId: input.workerId,
          profileId: profile?.id,
          restrictionType: PmWorkerMedicalRestrictionType.work_limitation,
          description: `Substance test ${input.outcome.replace(/_/g, ' ')} (${
            input.testType
          }) — pending SAP/DER review`,
          blocksHighRisk: true,
          blocksConfinedSpace: true,
          blocksHotWork: true,
          blocksEquipment: true,
          active: true,
        },
      });
      actions.medicalRestrictionId = restriction.id;

      await this.prisma.pmWorkerAccessRequirement.upsert({
        where: {
          workerId_requirementType_requirementKey_projectId: {
            workerId: input.workerId,
            requirementType: 'substance_testing',
            requirementKey: 'negative_test_required',
            projectId: input.projectId ?? null,
          },
        },
        create: {
          companyId: input.companyId,
          projectId: input.projectId,
          workerId: input.workerId,
          requirementType: 'substance_testing',
          requirementKey: 'negative_test_required',
          satisfied: false,
          metadataJson: {
            testEventId: input.testEventId,
            outcome: input.outcome,
          },
        },
        update: {
          satisfied: false,
          metadataJson: {
            testEventId: input.testEventId,
            outcome: input.outcome,
          },
        },
      });
      actions.accessRequirementBlocked = true;

      const trainingCodes = ['DOT_DRUG_AWARENESS', 'SUBSTANCE_ABUSE_POLICY'];
      for (const code of trainingCodes) {
        const row = await this.prisma.pmWorkerSafetyTraining.findFirst({
          where: { workerId: input.workerId, trainingCode: code },
        });
        if (row) {
          await this.prisma.pmWorkerSafetyTraining.update({
            where: { id: row.id },
            data: { status: 'suspended' },
          });
          actions[`trainingSuspended_${code}`] = row.id;
        }
      }
    }

    await this.notifyStakeholders(input);
    return actions;
  }

  private async clearSubstanceAccessBlock(
    workerId: number,
    companyId: number,
    projectId?: number,
  ) {
    await this.prisma.pmWorkerAccessRequirement.updateMany({
      where: {
        workerId,
        companyId,
        requirementType: 'substance_testing',
        requirementKey: 'negative_test_required',
        ...(projectId ? { projectId } : {}),
      },
      data: { satisfied: true },
    });
  }

  private async notifyStakeholders(input: {
    testEventId: string;
    workerId: number;
    companyId: number;
    outcome: PmSubstanceTestResultOutcome;
    testType: PmSubstanceTestType;
    workerName: string;
    projectName?: string;
  }) {
    if (!this.notifications) return;

    const base = {
      testEventId: input.testEventId,
      workerName: input.workerName,
      testType: input.testType,
      outcome: input.outcome,
      projectName: input.projectName,
    };

    const template =
      input.outcome === 'non_negative' || input.outcome === 'dilute'
        ? SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.nonNegativeAlert(base)
        : input.outcome === 'refusal'
        ? SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.refusalAlert(base)
        : input.outcome === 'tampered'
        ? SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.tamperedAlert(base)
        : SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.testResultRecorded(base);

    const hrUsers = await this.usersByRoles(input.companyId, [
      'COMPANY_ADMIN',
      'ADMIN',
    ]);
    const safetyUsers = await this.usersByRoles(input.companyId, [
      'SUPER_ADMIN',
      'PROJECT_MANAGER',
    ]);
    const supervisorUsers = await this.usersByRoles(input.companyId, [
      'SUPERVISOR',
    ]);

    const allIds = [
      ...new Set([...hrUsers, ...safetyUsers, ...supervisorUsers]),
    ];
    if (!allIds.length) return;

    await this.notifications.notifyUsers({
      userIds: allIds,
      type: template.type,
      title: template.title,
      body: template.body,
      payload: template.metadata as Record<string, unknown>,
      dedupeKey: `substance-result:${input.testEventId}:${input.outcome}`,
      companyId: input.companyId,
    });
  }

  async notifyTestScheduled(input: {
    testEventId: string;
    companyId: number;
    workerName: string;
    testType: PmSubstanceTestType;
    scheduledAt?: Date;
    projectName?: string;
  }) {
    if (!this.notifications) return;

    const template = SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.testScheduled({
      testEventId: input.testEventId,
      workerName: input.workerName,
      testType: input.testType,
      scheduledAt: input.scheduledAt?.toISOString(),
      projectName: input.projectName,
    });

    const userIds = await this.usersByRoles(input.companyId, [
      'SUPERVISOR',
      'COMPANY_ADMIN',
      'PROJECT_MANAGER',
    ]);

    if (!userIds.length) return;

    await this.notifications.notifyUsers({
      userIds,
      type: template.type,
      title: template.title,
      body: template.body,
      payload: template.metadata as Record<string, unknown>,
      dedupeKey: `substance-scheduled:${input.testEventId}`,
      companyId: input.companyId,
    });
  }

  private async usersByRoles(companyId: number, roles: string[]) {
    const users = await this.prisma.user.findMany({
      where: { companyId, role: { in: roles as never[] } },
      select: { id: true },
      take: 30,
    });
    return users.map((u) => u.id);
  }
}
