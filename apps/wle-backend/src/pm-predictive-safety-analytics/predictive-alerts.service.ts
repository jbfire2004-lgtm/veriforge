import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type {
  EntityRiskScore,
  PreventiveAction,
  WeeklyRiskForecast,
} from './types/predictive-analytics.types';

export const PREDICTIVE_ALERT_TEMPLATES = {
  weeklyForecast: (p: {
    projectName?: string;
    riskLevel: string;
    riskIndex: number;
    weekStart: string;
  }) => ({
    title: `Weekly risk forecast: ${p.riskLevel.toUpperCase()}`,
    body: `Project risk index ${p.riskIndex}/100 for week of ${p.weekStart}.${
      p.projectName ? ` ${p.projectName}.` : ''
    } Review preventive actions.`,
    type: 'predictive.weekly_forecast' as const,
    metadata: p,
  }),

  highRiskWorker: (p: {
    workerName: string;
    riskScore: number;
    factors: string[];
  }) => ({
    title: `High-risk worker: ${p.workerName}`,
    body: `Predicted risk ${p.riskScore}/100. Factors: ${p.factors
      .slice(0, 3)
      .join(', ')}.`,
    type: 'predictive.worker_risk' as const,
    metadata: p,
  }),

  highRiskContractor: (p: { contractorName: string; riskScore: number }) => ({
    title: `High-risk contractor: ${p.contractorName}`,
    body: `Contractor risk score ${p.riskScore}/100. Review dispatch compliance and deficiencies.`,
    type: 'predictive.contractor_risk' as const,
    metadata: p,
  }),

  preventiveAction: (p: { title: string; priority: string }) => ({
    title: `Preventive action: ${p.title}`,
    body: `Recommended ${p.priority} priority preventive action from predictive analytics.`,
    type: 'predictive.preventive_action' as const,
    metadata: p,
  }),
};

@Injectable()
export class PredictiveAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  async dispatchWeeklyAlerts(input: {
    companyId: number;
    projectId?: number;
    projectName?: string;
    forecast: WeeklyRiskForecast;
    highRiskWorkers: EntityRiskScore[];
    highRiskContractors: EntityRiskScore[];
    preventiveActions: PreventiveAction[];
  }) {
    if (!this.notifications) return { sent: 0 };

    const userIds = await this.stakeholderUserIds(input.companyId);
    if (!userIds.length) return { sent: 0 };

    let sent = 0;

    if (['high', 'critical'].includes(input.forecast.overallRiskLevel)) {
      const t = PREDICTIVE_ALERT_TEMPLATES.weeklyForecast({
        projectName: input.projectName,
        riskLevel: input.forecast.overallRiskLevel,
        riskIndex: input.forecast.overallRiskIndex,
        weekStart: input.forecast.weekStart,
      });
      await this.notifications.notifyUsers({
        userIds,
        type: t.type,
        title: t.title,
        body: t.body,
        payload: t.metadata as Record<string, unknown>,
        dedupeKey: `predictive-weekly:${input.companyId}:${input.projectId}:${input.forecast.weekStart}`,
        companyId: input.companyId,
      });
      sent++;
    }

    for (const w of input.highRiskWorkers
      .filter((x) => x.riskLevel === 'critical')
      .slice(0, 5)) {
      const t = PREDICTIVE_ALERT_TEMPLATES.highRiskWorker({
        workerName: w.label,
        riskScore: w.riskScore,
        factors: w.factors,
      });
      await this.notifications.notifyUsers({
        userIds,
        type: t.type,
        title: t.title,
        body: t.body,
        payload: t.metadata as Record<string, unknown>,
        dedupeKey: `predictive-worker:${w.entityId}:${input.forecast.weekStart}`,
        companyId: input.companyId,
      });
      sent++;
    }

    for (const c of input.highRiskContractors
      .filter((x) => x.riskLevel === 'high' || x.riskLevel === 'critical')
      .slice(0, 3)) {
      const t = PREDICTIVE_ALERT_TEMPLATES.highRiskContractor({
        contractorName: c.label,
        riskScore: c.riskScore,
      });
      await this.notifications.notifyUsers({
        userIds,
        type: t.type,
        title: t.title,
        body: t.body,
        payload: t.metadata as Record<string, unknown>,
        dedupeKey: `predictive-contractor:${c.entityId}:${input.forecast.weekStart}`,
        companyId: input.companyId,
      });
      sent++;
    }

    for (const a of input.preventiveActions
      .filter((x) => x.priority === 'critical')
      .slice(0, 3)) {
      const t = PREDICTIVE_ALERT_TEMPLATES.preventiveAction({
        title: a.title,
        priority: a.priority,
      });
      await this.notifications.notifyUsers({
        userIds,
        type: t.type,
        title: t.title,
        body: t.body,
        payload: t.metadata as Record<string, unknown>,
        dedupeKey: `predictive-action:${a.id}`,
        companyId: input.companyId,
      });
      sent++;
    }

    return { sent };
  }

  private async stakeholderUserIds(companyId: number) {
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        role: {
          in: [
            'SUPERVISOR',
            'COMPANY_ADMIN',
            'PROJECT_MANAGER',
            'ADMIN',
            'SUPER_ADMIN',
          ],
        },
      },
      select: { id: true },
      take: 40,
    });
    return users.map((u) => u.id);
  }
}
