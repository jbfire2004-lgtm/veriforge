import type { EscalationTrigger } from '../types';

const ESCALATION_LEVELS: Record<number, string> = {
  1: 'Overdue — supervisor notification',
  2: 'Overdue 1+ days — supervisor escalation',
  3: 'Overdue 3+ days — safety manager escalation',
  4: 'Overdue 7+ days or critical severity — PM escalation',
  5: 'SIF/HECA or equipment unsafe — executive escalation',
};

export class EscalationEngine {
  evaluate(input: {
    dueDate?: Date | null;
    severity: string;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    equipmentUnsafe?: boolean;
    currentLevel?: number;
    status: string;
  }): EscalationTrigger | null {
    if (['closed', 'verified', 'cancelled'].includes(input.status)) {
      return null;
    }

    const now = Date.now();
    const overdue = input.dueDate ? input.dueDate.getTime() < now : false;
    const currentLevel = input.currentLevel ?? 0;

    if (input.equipmentUnsafe && currentLevel < 5) {
      return { level: 5, reason: ESCALATION_LEVELS[5], shouldNotify: true };
    }

    if ((input.sifLinked || input.hecaLinked) && currentLevel < 5) {
      return { level: 5, reason: 'SIF/HECA-linked CAPA — safety escalation', shouldNotify: true };
    }

    if (input.severity === 'critical' && currentLevel < 4) {
      return { level: 4, reason: ESCALATION_LEVELS[4], shouldNotify: true };
    }

    if (overdue && input.dueDate) {
      const daysOver = Math.floor((now - input.dueDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysOver >= 7 && currentLevel < 4) {
        return { level: 4, reason: ESCALATION_LEVELS[4], shouldNotify: true };
      }
      if (daysOver >= 3 && currentLevel < 3) {
        return { level: 3, reason: ESCALATION_LEVELS[3], shouldNotify: true };
      }
      if (daysOver >= 1 && currentLevel < 2) {
        return { level: 2, reason: ESCALATION_LEVELS[2], shouldNotify: true };
      }
      if (currentLevel < 1) {
        return { level: 1, reason: ESCALATION_LEVELS[1], shouldNotify: true };
      }
    }

    return null;
  }
}

export const escalationEngine = new EscalationEngine();
