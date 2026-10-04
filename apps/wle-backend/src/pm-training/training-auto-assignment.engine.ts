import { Injectable } from '@nestjs/common';

export type MatrixRule = {
  trainingCode: string;
  trainingName: string;
  expiresInDays: number;
};

@Injectable()
export class TrainingAutoAssignmentEngine {
  /** Returns matrix rules not yet represented by an open training record. */
  missingAssignments(
    required: MatrixRule[],
    heldCodes: string[],
  ): MatrixRule[] {
    const set = new Set(heldCodes.map((c) => c.toUpperCase()));
    return required.filter((r) => !set.has(r.trainingCode.toUpperCase()));
  }
}
