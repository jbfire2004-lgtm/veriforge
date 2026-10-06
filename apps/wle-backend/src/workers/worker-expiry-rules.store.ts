import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type WorkerExpiryRules = {
  orientationExpiryDays: number;
  certificationExpiryDays: number;
  notSeenDays: number;
  autoDeactivate: boolean;
  autoNotify: boolean;
};

export const DEFAULT_WORKER_EXPIRY_RULES: WorkerExpiryRules = {
  orientationExpiryDays: 90,
  certificationExpiryDays: 365,
  notSeenDays: 30,
  autoDeactivate: true,
  autoNotify: true,
};

@Injectable()
export class WorkerExpiryRulesStore {
  constructor(private readonly prisma: PrismaService) {}

  async getRules(companyId: number): Promise<WorkerExpiryRules> {
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        orientation_expiry_days: number;
        certification_expiry_days: number;
        not_seen_days: number;
        auto_deactivate: boolean;
        auto_notify: boolean;
      }>
    >(
      `
      SELECT
        orientation_expiry_days,
        certification_expiry_days,
        not_seen_days,
        auto_deactivate,
        auto_notify
      FROM worker_lifecycle_rule_set
      WHERE company_id = $1
      LIMIT 1
      `,
      companyId,
    );

    const row = rows[0];
    if (!row) return { ...DEFAULT_WORKER_EXPIRY_RULES };

    return {
      orientationExpiryDays: row.orientation_expiry_days,
      certificationExpiryDays: row.certification_expiry_days,
      notSeenDays: row.not_seen_days,
      autoDeactivate: row.auto_deactivate,
      autoNotify: row.auto_notify,
    };
  }

  async saveRules(
    companyId: number,
    patch: Partial<WorkerExpiryRules>,
  ): Promise<WorkerExpiryRules> {
    const current = await this.getRules(companyId);
    const next: WorkerExpiryRules = {
      ...current,
      ...patch,
    };

    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO worker_lifecycle_rule_set (
        company_id,
        orientation_expiry_days,
        certification_expiry_days,
        not_seen_days,
        auto_deactivate,
        auto_notify
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (company_id)
      DO UPDATE SET
        orientation_expiry_days = EXCLUDED.orientation_expiry_days,
        certification_expiry_days = EXCLUDED.certification_expiry_days,
        not_seen_days = EXCLUDED.not_seen_days,
        auto_deactivate = EXCLUDED.auto_deactivate,
        auto_notify = EXCLUDED.auto_notify,
        updated_at = NOW()
      `,
      companyId,
      next.orientationExpiryDays,
      next.certificationExpiryDays,
      next.notSeenDays,
      next.autoDeactivate,
      next.autoNotify,
    );

    return next;
  }
}
