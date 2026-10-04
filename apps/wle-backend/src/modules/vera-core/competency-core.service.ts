import { Injectable } from '@nestjs/common';
import { CompetencyService } from '../competency/competency.service';

/** Thin adapter — canonical logic lives in {@link CompetencyService}. */
@Injectable()
export class CompetencyCoreService {
  constructor(private readonly competency: CompetencyService) {}

  evaluate(data: Parameters<CompetencyService['evaluate']>[0]) {
    return this.competency.evaluate(data);
  }

  listForWorker(workerId: number) {
    return this.competency.listForWorker(workerId);
  }

  check(workerId: number, equipmentId: number) {
    return this.competency.checkWorkerEquipment(workerId, equipmentId);
  }
}
