import { Injectable } from '@nestjs/common';
import { CailSourceType, CailSeverity } from '@prisma/client';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
import type { JhaEvaluationResult } from './jha-scoring.service';

@Injectable()
export class JhaCailBridgeService {
  constructor(private readonly emitter: CailEmitterService) {}

  async emitFromEvaluation(
    jhaId: string,
    projectId: number,
    ownerCompanyId: number,
    kind: 'FLHA' | 'JHA',
    evaluation: JhaEvaluationResult,
    createdByUserId?: number,
    siteId?: number | null,
  ) {
    const sourceType: CailSourceType = kind === 'FLHA' ? 'flha' : 'jha';
    const entries = [];

    for (const reason of evaluation.missingControls) {
      const entry = await this.emitter.emit({
        projectId,
        ownerCompanyId,
        sourceType,
        sourceId: jhaId,
        sourceItemId: `missing-${reason.slice(0, 40)}`,
        title: `JHA: ${reason.slice(0, 100)}`,
        description: reason,
        severity: evaluation.sifPotential ? 'critical' : 'high',
        createdByUserId,
        siteId: siteId ?? undefined,
      });
      entries.push(entry);
    }

    if (evaluation.sifPotential) {
      const entry = await this.emitter.emit({
        projectId,
        ownerCompanyId,
        sourceType: 'sif',
        sourceId: jhaId,
        sourceItemId: 'sif-flag',
        title: 'SIF potential — JHA review required',
        description: `SIF score ${evaluation.sifScore}. Supervisor review mandatory.`,
        severity: 'critical' as CailSeverity,
        createdByUserId,
        siteId: siteId ?? undefined,
      });
      entries.push(entry);
    }

    return entries;
  }
}
