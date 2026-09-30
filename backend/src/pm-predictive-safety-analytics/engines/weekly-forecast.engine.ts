import { Injectable } from '@nestjs/common';
import type {
  RiskLevel,
  WeeklyForecastDay,
  WeeklyRiskForecast,
} from '../types/predictive-analytics.types';

@Injectable()
export class WeeklyForecastEngine {
  build(input: {
    baseRiskIndex: number;
    trendSlope: number;
    drivers: string[];
    weekStart?: Date;
  }): WeeklyRiskForecast {
    const start = input.weekStart ?? this.startOfWeek(new Date());
    const days: WeeklyForecastDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const weekdayBoost =
        [0, 0.08, 0.05, 0.03, 0.02, 0.06, -0.02][d.getDay()] ?? 0;
      const trendAdj = input.trendSlope * (i / 7);
      const riskIndex = Math.max(
        5,
        Math.min(
          98,
          Math.round(input.baseRiskIndex + weekdayBoost * 100 + trendAdj * 20),
        ),
      );
      days.push({
        date: d.toISOString().slice(0, 10),
        dayOfWeek: dayNames[d.getDay()]!,
        riskIndex,
        riskLevel: this.toLevel(riskIndex),
        drivers:
          i === 0 ? input.drivers.slice(0, 4) : input.drivers.slice(0, 2),
      });
    }

    const overallRiskIndex = Math.round(
      days.reduce((s, d) => s + d.riskIndex, 0) / days.length,
    );

    return {
      weekStart: start.toISOString().slice(0, 10),
      weekEnd: days[6]!.date,
      overallRiskIndex,
      overallRiskLevel: this.toLevel(overallRiskIndex),
      days,
      trend:
        input.trendSlope > 0.05
          ? 'worsening'
          : input.trendSlope < -0.05
          ? 'improving'
          : 'stable',
    };
  }

  private startOfWeek(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private toLevel(index: number): RiskLevel {
    if (index >= 75) return 'critical';
    if (index >= 55) return 'high';
    if (index >= 35) return 'medium';
    return 'low';
  }
}
