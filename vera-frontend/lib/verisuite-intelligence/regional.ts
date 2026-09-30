/**
 * Regional Drilldown Engine — Global → … → city_band (site_band tenant-only).
 */

import {
  breadcrumbs,
  canIndustryAggregate,
  childrenOf,
  getGeoNode,
  type GeoLevel,
} from "./geo";
import { aggregateCohort } from "./aggregate";
import { detectInsights } from "./insights";
import type {
  IndustryCode,
  IntelligencePlane,
  RegionalChild,
  RegionalDrillResponse,
} from "./types";

export function regionalDrill(opts: {
  plane: IntelligencePlane;
  industry: IndustryCode;
  regionCode?: string;
}): RegionalDrillResponse {
  const code = opts.regionCode ?? "GLB";
  const node = getGeoNode(code) ?? {
    level: "global" as GeoLevel,
    code: "GLB",
    label: "Global",
    parentCode: null,
    industryPoolAllowed: true,
  };

  const crumbs = breadcrumbs(node.code).map((n) => ({
    code: n.code,
    label: n.label,
    level: n.level,
  }));

  const selfMetrics = canIndustryAggregate(node.level)
    ? aggregateCohort({
        plane: opts.plane,
        industry: opts.industry,
        regionCode: node.code,
      })
    : {
        trif: null,
        ltif: null,
        nearMissRate: null,
        trainingCompliantPct: null,
        capaClosureDays: null,
        highRiskPermitOpen: null,
        hecaHighEnergyPct: null,
        entityCount: null,
        suppressed: true,
      };

  const children: RegionalChild[] = childrenOf(node.code)
    .filter((c) => canIndustryAggregate(c.level))
    .map((c) => {
      const metrics = aggregateCohort({
        plane: opts.plane,
        industry: opts.industry,
        regionCode: c.code,
      });
      return {
        code: c.code,
        label: c.label,
        level: c.level,
        suppressed: metrics.suppressed,
        entityCount: metrics.entityCount,
        metrics: metrics.suppressed ? null : metrics,
      };
    });

  return {
    node: { level: node.level, code: node.code, label: node.label },
    breadcrumbs: crumbs,
    children,
    selfMetrics,
    insights: detectInsights({
      plane: opts.plane,
      industry: opts.industry,
      regionCode: node.code,
      metrics: selfMetrics,
    }),
  };
}
