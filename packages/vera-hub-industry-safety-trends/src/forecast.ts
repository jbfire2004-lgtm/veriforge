import { clamp, finiteNumbers, linearSlope, mean, round, stddev } from "./stats";
import { horizonSteps, nextPeriod, parsePeriod } from "./periods";
import { filterUsable } from "./series";
import { analyzeTrifLtifTrend } from "./trif-ltif";
import type {
  DataPlane,
  PredictiveRiskForecast,
  PredictiveRiskPoint,
  RiskForecastHorizon,
  TrendCohortScope,
  TrendSeriesPoint,
} from "./types";

function projectSeries(
  values: number[],
  steps: number,
): { predicted: number[]; confidence: number } {
  const slope = linearSlope(values) ?? 0;
  const last = values[values.length - 1] ?? 0;
  const sd = stddev(values) ?? 0;
  const predicted: number[] = [];
  for (let i = 1; i <= steps; i++) {
    predicted.push(Math.max(0, last + slope * i));
  }
  // Confidence decays with horizon and volatility
  const base = values.length >= 6 ? 0.75 : values.length >= 3 ? 0.55 : 0.35;
  const volPenalty = clamp(sd / (mean(values) || 1), 0, 0.4);
  const confidence = round(clamp(base - volPenalty - steps * 0.04), 3);
  return { predicted, confidence };
}

export function forecastPredictiveRisk(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
  horizon: RiskForecastHorizon = "3m",
): PredictiveRiskForecast {
  const trifLtif = analyzeTrifLtifTrend(plane, scope, series);
  const usable = filterUsable(series);

  if (usable.length < 2) {
    return {
      plane,
      scope,
      horizon,
      history: trifLtif.points,
      forecast: [],
      drivers: [],
      suppressed: true,
    };
  }

  const trifs = finiteNumbers(
    usable.map((p) => p.metrics!.recordableRatePer200k),
  );
  const ltifs = finiteNumbers(usable.map((p) => p.metrics!.lostTimeRatePer200k));
  const hecas = finiteNumbers(usable.map((p) => p.metrics!.hecaHighEnergyRate));

  const lastPeriod = usable[usable.length - 1]!.period;
  const kind = parsePeriod(lastPeriod)?.kind ?? "month";
  const steps = horizonSteps(horizon, kind);

  const trifProj = trifs.length >= 2 ? projectSeries(trifs, steps) : null;
  const ltifProj = ltifs.length >= 2 ? projectSeries(ltifs, steps) : null;
  const hecaProj = hecas.length >= 2 ? projectSeries(hecas, steps) : null;

  const forecast: PredictiveRiskPoint[] = [];
  let cursor = lastPeriod;
  for (let i = 0; i < steps; i++) {
    const nxt = nextPeriod(cursor);
    if (!nxt) break;
    cursor = nxt;
    const predictedTrif = trifProj ? round(trifProj.predicted[i]!, 4) : null;
    const predictedLtif = ltifProj ? round(ltifProj.predicted[i]!, 4) : null;
    const predictedHecaHighEnergy = hecaProj
      ? round(hecaProj.predicted[i]!, 4)
      : null;

    // Risk index 0–100: blend normalized rates (higher = more risk)
    const parts: number[] = [];
    if (predictedTrif != null) parts.push(clamp(predictedTrif / 5) * 100);
    if (predictedLtif != null) parts.push(clamp(predictedLtif / 2) * 100);
    if (predictedHecaHighEnergy != null)
      parts.push(clamp(predictedHecaHighEnergy) * 100);
    const riskIndex =
      parts.length > 0
        ? round(parts.reduce((s, v) => s + v, 0) / parts.length, 1)
        : null;

    const confs = [
      trifProj?.confidence,
      ltifProj?.confidence,
      hecaProj?.confidence,
    ].filter((c): c is number => c != null);

    forecast.push({
      period: cursor,
      predictedTrif,
      predictedLtif,
      predictedHecaHighEnergy,
      riskIndex,
      confidence: confs.length ? round(mean(confs)!, 3) : null,
    });
  }

  const drivers: string[] = [];
  if (trifLtif.trifSlope != null && trifLtif.trifSlope > 0.02)
    drivers.push("rising_trif");
  if (trifLtif.ltifSlope != null && trifLtif.ltifSlope > 0.01)
    drivers.push("rising_ltif");
  const lastHeca = usable[usable.length - 1]?.metrics?.hecaHighEnergyRate;
  if (lastHeca != null && lastHeca > 0.15) drivers.push("elevated_heca");
  const lastCv = usable[usable.length - 1]?.metrics?.hecaControlsVerifiedRate;
  if (lastCv != null && lastCv < 0.7) drivers.push("weak_controls_verification");

  return {
    plane,
    scope,
    horizon,
    history: trifLtif.points,
    forecast,
    drivers,
    suppressed: false,
  };
}
