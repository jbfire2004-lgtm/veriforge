import { blindAggregate, groupFactsByCohort, shouldSuppress } from "./aggregate";
import {
  assertCrossCompareConsent,
  assertNoCrossPlaneTokenJoin,
  assertSinglePlane,
  assertSubtypeMatchesPlane,
  partitionByPlane,
  PlaneIsolationError,
} from "./isolation";
import {
  normalizeMetrics,
  standardizeCompanyType,
  standardizeIndustry,
  standardizeProjectType,
  standardizeScale,
} from "./normalize";
import { stripIdentifiers } from "./strip";
import {
  assertTokenNotInPublicPayload,
  tokenizeCompanyId,
  tokenizeEntityId,
  tokenizeProjectId,
} from "./tokenize";
import type {
  BlindAggregateResult,
  CohortKey,
  DataPlane,
  NormalizedPlaneFact,
  RawEntityRecord,
  StrippedRecord,
} from "./types";
import { MIN_SAMPLE } from "./types";

export type IngestResult =
  | { ok: true; fact: NormalizedPlaneFact }
  | { ok: false; error: string };

/**
 * VeriHub Anonymization & Normalization Engine
 *
 * Pipeline: Strip → Tokenize → Normalize → (Blind Aggregate)
 * Enforces min sample, plane isolation, and token non-leakage.
 */
export class VeriHubAnonymizationNormalizationEngine {
  readonly minSample = MIN_SAMPLE;

  /** Full privacy pipeline for a single raw record */
  ingest(raw: RawEntityRecord): IngestResult {
    try {
      if (raw.entityType !== "project" && raw.entityType !== "company") {
        return { ok: false, error: "entityType must be project or company" };
      }

      const stripped = stripIdentifiers(raw);
      const fact = this.normalizeStripped(stripped);
      if (!fact.ok) return fact;

      assertTokenNotInPublicPayload({
        industry: fact.fact.industry,
        subtype: fact.fact.subtype,
        scale: fact.fact.scale,
        metrics: fact.fact.metrics,
      });

      return fact;
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "ingest failed",
      };
    }
  }

  ingestMany(raws: RawEntityRecord[]): {
    facts: NormalizedPlaneFact[];
    errors: Array<{ index: number; error: string }>;
  } {
    const facts: NormalizedPlaneFact[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    raws.forEach((raw, index) => {
      const result = this.ingest(raw);
      if (result.ok) facts.push(result.fact);
      else errors.push({ index, error: result.error });
    });
    return { facts, errors };
  }

  normalizeStripped(stripped: StrippedRecord): IngestResult {
    const plane = stripped.entityType;
    const id =
      plane === "project" ? stripped.projectId : stripped.companyId;
    if (id == null) {
      return {
        ok: false,
        error: `${plane}Id is required for tokenization`,
      };
    }

    const industry = standardizeIndustry(stripped.industry);
    if (!industry) {
      return { ok: false, error: "Unable to standardize industry" };
    }

    const subtype =
      plane === "project"
        ? standardizeProjectType(
            stripped.projectType ?? stripped.subtype,
          )
        : standardizeCompanyType(
            stripped.companyType ?? stripped.subtype,
          );
    if (!subtype) {
      return {
        ok: false,
        error: `Unable to standardize ${plane} type/subtype`,
      };
    }

    try {
      assertSubtypeMatchesPlane(plane, subtype);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "plane mismatch",
      };
    }

    const scale = standardizeScale(stripped.scale, {
      workerCount: stripped.workerCount,
      peakWorkers: stripped.peakWorkers,
      contractValueUsd: stripped.contractValueUsd,
      entityType: plane,
    });
    if (!scale) {
      return { ok: false, error: "Unable to standardize scale" };
    }

    if (!stripped.period) {
      return { ok: false, error: "period is required" };
    }

    const token = tokenizeEntityId(plane, id);
    const metrics = normalizeMetrics(stripped);

    return {
      ok: true,
      fact: {
        plane,
        token,
        industry,
        subtype,
        scale,
        period: stripped.period,
        regionBand: stripped.regionCode,
        metrics,
      },
    };
  }

  /** Strip stage only */
  strip(raw: RawEntityRecord): StrippedRecord {
    return stripIdentifiers(raw);
  }

  tokenizeProject(id: string | number): string {
    return tokenizeProjectId(id);
  }

  tokenizeCompany(id: string | number): string {
    return tokenizeCompanyId(id);
  }

  aggregateCohort(
    facts: NormalizedPlaneFact[],
    key: CohortKey,
  ): BlindAggregateResult {
    // Enforce isolation: only same-plane facts
    const { project, company } = partitionByPlane(facts);
    const planeFacts = key.entityType === "project" ? project : company;
    assertNoCrossPlaneTokenJoin(
      project.map((f) => f.token),
      company.map((f) => f.token),
    );
    return blindAggregate(planeFacts, key, {
      minSample: this.minSample,
      hideExactCountWhenSuppressed: true,
    });
  }

  aggregateAll(facts: NormalizedPlaneFact[]): BlindAggregateResult[] {
    const groups = groupFactsByCohort(facts);
    const results: BlindAggregateResult[] = [];
    for (const [keyStr, group] of groups) {
      const [entityType, industry, subtype, scale, period] = keyStr.split("|");
      results.push(
        this.aggregateCohort(group, {
          entityType: entityType as DataPlane,
          industry: industry as CohortKey["industry"],
          subtype: subtype as CohortKey["subtype"],
          scale: scale as CohortKey["scale"],
          period,
        }),
      );
    }
    return results;
  }

  enforcePlaneFilters(
    plane: DataPlane,
    filters: {
      projectType?: string;
      projectId?: string;
      companyType?: string;
      companyId?: string;
      entityType?: string;
    },
  ): void {
    assertSinglePlane(plane, filters);
  }

  enforceCrossCompare(input: {
    explicitConsent?: boolean;
    hasPermission?: boolean;
  }): void {
    assertCrossCompareConsent(input);
  }

  isSuppressed(entityCount: number): boolean {
    return shouldSuppress(entityCount, this.minSample);
  }

  /** Public response sanitizer — strips tokens if somehow present */
  toPublicAggregate(result: BlindAggregateResult): {
    cohort: CohortKey;
    suppressed: boolean;
    entityCount: number | null;
    metrics: BlindAggregateResult["metrics"];
  } {
    const publicPayload = {
      cohort: result.key,
      suppressed: result.suppressed,
      entityCount: result.entityCount,
      metrics: result.metrics,
    };
    assertTokenNotInPublicPayload(publicPayload);
    return publicPayload;
  }
}

export { PlaneIsolationError };
