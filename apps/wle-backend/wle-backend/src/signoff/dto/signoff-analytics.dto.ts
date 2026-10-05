export class WeeklyTrendPoint {
  label: string;
  count: number;
}

export class SignoffAnalyticsDto {
  total: number;
  safeCount: number;
  unsafeCount: number;
  workerCount: number;
  equipmentCount: number;
  checklistFailures: Record<string, number>;
  weeklyTrend: WeeklyTrendPoint[];
}
