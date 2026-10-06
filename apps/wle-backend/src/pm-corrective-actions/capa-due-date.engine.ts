import { Injectable } from '@nestjs/common';
import { CailSeverity } from '@prisma/client';
import { DUE_DAYS_DEFAULT } from './pm-capa.constants';

@Injectable()
export class CapaDueDateEngine {
  computeDueAt(
    severity: CailSeverity | string,
    config?: {
      dueDaysLow?: number;
      dueDaysMedium?: number;
      dueDaysHigh?: number;
      dueDaysCritical?: number;
    },
    from = new Date(),
  ): Date {
    const days =
      severity === 'critical'
        ? config?.dueDaysCritical ?? DUE_DAYS_DEFAULT.critical
        : severity === 'high'
        ? config?.dueDaysHigh ?? DUE_DAYS_DEFAULT.high
        : severity === 'medium'
        ? config?.dueDaysMedium ?? DUE_DAYS_DEFAULT.medium
        : config?.dueDaysLow ?? DUE_DAYS_DEFAULT.low;
    return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
