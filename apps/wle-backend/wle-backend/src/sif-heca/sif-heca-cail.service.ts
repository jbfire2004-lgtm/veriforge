import { Injectable } from '@nestjs/common';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';

@Injectable()
export class SifHecaCailService {
  constructor(private readonly emitter: CailEmitterService) {}

  async emitCorrectiveActions(
    eventId: string,
    projectId: number,
    ownerCompanyId: number,
    items: Array<{
      title: string;
      description?: string;
      severity?: 'high' | 'critical';
    }>,
    createdByUserId?: number,
    siteId?: number,
    workerId?: number,
  ) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const entry = await this.emitter.emit({
        projectId,
        ownerCompanyId,
        sourceType: 'sif',
        sourceId: eventId,
        sourceItemId: `capa-${i}`,
        title: item.title.slice(0, 120),
        description: item.description,
        severity: item.severity ?? 'high',
        createdByUserId,
        siteId,
        workerId,
      });
      results.push(entry);
    }
    return results;
  }
}
