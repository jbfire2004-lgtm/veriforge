import { NextResponse } from "next/server";
import {
  getEngineStatus,
  ingestRaw,
  blindAggregate,
  getFacts,
} from "@/lib/anonymization-normalization-engine";
import type {
  BlindAggregateKey,
  EntityPlane,
  RawSensitiveRecord,
} from "@/lib/anonymization-normalization-engine/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "anonymization-normalization";

export async function GET() {
  return cachedJsonResponse(NS, { view: "status" }, () => getEngineStatus());
}

/**
 * POST actions:
 * - { action: "ingest", record: RawSensitiveRecord }
 * - { action: "aggregate", key: BlindAggregateKey }
 * - default: return status
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: "ingest" | "aggregate" | "status";
    record?: RawSensitiveRecord;
    key?: BlindAggregateKey;
  };

  if (body.action === "ingest" && body.record) {
    const result = ingestRaw(body.record);
    invalidateAggregateNamespace(NS);
    return NextResponse.json({
      action: "ingest",
      strippedFields: result.strippedFields,
      tokens: result.tokens,
      fact: result.fact,
      status: getEngineStatus(),
    });
  }

  if (body.action === "aggregate" && body.key) {
    const key: BlindAggregateKey = {
      plane: body.key.plane as EntityPlane,
      industryBand: body.key.industryBand,
      period: body.key.period,
      regionBand: body.key.regionBand,
    };
    const cacheParts = {
      view: "aggregate",
      plane: key.plane,
      industryBand: key.industryBand,
      period: key.period,
      regionBand: key.regionBand,
    };
    return cachedJsonResponse(NS, cacheParts, () => ({
      action: "aggregate" as const,
      result: blindAggregate(getFacts(), key),
      status: getEngineStatus(),
    }));
  }

  return NextResponse.json(getEngineStatus());
}
