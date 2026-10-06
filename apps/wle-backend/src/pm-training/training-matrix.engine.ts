import { Injectable } from '@nestjs/common';
import type { PmCompanyTrainingMatrix } from '@prisma/client';

@Injectable()
export class TrainingMatrixEngine {
  /** Group matrix rows by role → required_courses JSON shape from spec. */
  groupByRole(rows: PmCompanyTrainingMatrix[]) {
    const byRole: Record<
      string,
      Array<{
        trainingCode: string;
        trainingName: string;
        category: string;
        expiresInDays: number;
      }>
    > = {};
    for (const row of rows) {
      if (!byRole[row.roleType]) byRole[row.roleType] = [];
      byRole[row.roleType].push({
        trainingCode: row.trainingCode,
        trainingName: row.trainingName,
        category: row.category,
        expiresInDays: row.expiresInDays,
      });
    }
    return byRole;
  }

  requiredForRole(
    rows: PmCompanyTrainingMatrix[],
    roleType: string,
  ): Array<{
    trainingCode: string;
    trainingName: string;
    expiresInDays: number;
  }> {
    return rows
      .filter((r) => r.roleType === roleType && r.active)
      .map((r) => ({
        trainingCode: r.trainingCode,
        trainingName: r.trainingName,
        expiresInDays: r.expiresInDays,
      }));
  }
}
