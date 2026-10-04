import { Injectable } from '@nestjs/common';
import { ESCALATION_LEVELS } from './pm-capa.constants';

export type EscalationTrigger = {
  level: number;
  reason: string;
  shouldNotify: boolean;
};

@Injectable()
export class CapaEscalationEngine {
  evaluate(input: {
    dueAt?: Date | null;
    severity: string;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    equipmentUnsafe?: boolean;
    currentLevel?: number;
    status: string;
  }): EscalationTrigger | null {
    if (
      input.status === 'closed' ||
      input.status === 'verified' ||
      input.status === 'cancelled'
    ) {
      return null;
    }

    const now = Date.now();
    const overdue = input.dueAt ? input.dueAt.getTime() < now : false;

    if (input.equipmentUnsafe && (input.currentLevel ?? 0) < 3) {
      return {
        level: 3,
        reason: 'Equipment unsafe — safety escalation',
        shouldNotify: true,
      };
    }

    if (
      (input.sifLinked || input.hecaLinked) &&
      (input.currentLevel ?? 0) < 3
    ) {
      return {
        level: 3,
        reason: 'SIF/HECA-linked CAPA — safety escalation',
        shouldNotify: true,
      };
    }

    if (input.severity === 'critical' && (input.currentLevel ?? 0) < 4) {
      return {
        level: 4,
        reason: 'Critical severity — PM escalation',
        shouldNotify: true,
      };
    }

    if (overdue) {
      const daysOver = input.dueAt
        ? Math.floor((now - input.dueAt.getTime()) / (24 * 60 * 60 * 1000))
        : 0;
      if (daysOver >= 7 && (input.currentLevel ?? 0) < 5) {
        return { level: 5, reason: ESCALATION_LEVELS[5], shouldNotify: true };
      }
      if (daysOver >= 3 && (input.currentLevel ?? 0) < 4) {
        return { level: 4, reason: ESCALATION_LEVELS[4], shouldNotify: true };
      }
      if (daysOver >= 1 && (input.currentLevel ?? 0) < 2) {
        return { level: 2, reason: ESCALATION_LEVELS[2], shouldNotify: true };
      }
      if ((input.currentLevel ?? 0) < 1) {
        return { level: 1, reason: ESCALATION_LEVELS[1], shouldNotify: true };
      }
    }

    return null;
  }
}
