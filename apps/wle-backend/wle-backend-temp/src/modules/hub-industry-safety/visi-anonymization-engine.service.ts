import { Injectable } from '@nestjs/common';
import {
  VeriHubAnonymizationNormalizationEngine,
  type BlindAggregateResult,
  type CohortKey,
  type NormalizedPlaneFact,
  type RawEntityRecord,
} from '@vera/hub-industry-safety';

/**
 * Nest-injectable facade over the VeriHub Anonymization & Normalization Engine.
 */
@Injectable()
export class VisiAnonymizationEngineService {
  private readonly engine = new VeriHubAnonymizationNormalizationEngine();

  /** In-memory plane stores (demo / staging). Replace with durable store in prod. */
  private readonly projectFacts = new Map<string, NormalizedPlaneFact>();
  private readonly companyFacts = new Map<string, NormalizedPlaneFact>();

  get engineInstance(): VeriHubAnonymizationNormalizationEngine {
    return this.engine;
  }

  ingest(raw: RawEntityRecord) {
    const result = this.engine.ingest(raw);
    if (!result.ok) return result;
    const fact = result.fact;
    const store =
      fact.plane === 'project' ? this.projectFacts : this.companyFacts;
    const dedupeKey = `${fact.token}|${fact.period}`;
    store.set(dedupeKey, fact);
    return result;
  }

  ingestMany(raws: RawEntityRecord[]) {
    const { facts, errors } = this.engine.ingestMany(raws);
    for (const fact of facts) {
      const store =
        fact.plane === 'project' ? this.projectFacts : this.companyFacts;
      store.set(`${fact.token}|${fact.period}`, fact);
    }
    return {
      accepted: facts.length,
      rejected: errors.length,
      errors,
      planes: {
        projectFacts: this.projectFacts.size,
        companyFacts: this.companyFacts.size,
      },
    };
  }

  aggregate(key: CohortKey): BlindAggregateResult {
    const facts =
      key.entityType === 'project'
        ? [...this.projectFacts.values()]
        : [...this.companyFacts.values()];
    const matching = facts.filter(
      (f) =>
        f.industry === key.industry &&
        f.subtype === key.subtype &&
        f.scale === key.scale &&
        f.period === key.period,
    );
    return this.engine.aggregateCohort(matching, key);
  }

  enforcePlane(
    plane: 'project' | 'company',
    filters: Record<string, string | undefined>,
  ) {
    this.engine.enforcePlaneFilters(plane, filters);
  }

  stats() {
    return {
      minSample: this.engine.minSample,
      projectFacts: this.projectFacts.size,
      companyFacts: this.companyFacts.size,
    };
  }

  /** Plane-scoped facts for trend engines (tokens stay internal). */
  listFacts(plane: 'project' | 'company'): NormalizedPlaneFact[] {
    const store = plane === 'project' ? this.projectFacts : this.companyFacts;
    return [...store.values()];
  }

  listFactsForCohort(key: Omit<CohortKey, 'period'> & { periods?: string[] }) {
    const facts = this.listFacts(key.entityType).filter(
      (f) =>
        f.industry === key.industry &&
        f.subtype === key.subtype &&
        f.scale === key.scale &&
        (!key.periods?.length || key.periods.includes(f.period)),
    );
    return facts;
  }
}
