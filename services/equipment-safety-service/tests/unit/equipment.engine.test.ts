import { describe, it, expect } from 'vitest';
import { InspectionStatus } from '@prisma/client';
import {
  conditionScoringEngine,
  lockoutEngine,
  inspectionScheduleEngine,
  isAuthorizationActive,
} from '../../src/engines/equipment.engine';
import { AuthorizationStatus } from '@prisma/client';

const baseEquipment = {
  id: 'eq-1',
  companyId: 'co-1',
  projectId: null,
  type: 'forklift',
  model: 'X1',
  serialNumber: 'SN-1',
  status: 'active' as const,
  conditionScore: 100,
  lastInspectionDate: null,
  nextInspectionDue: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('condition scoring engine', () => {
  it('scores passed inspection highly', () => {
    const result = conditionScoringEngine.compute({
      equipment: baseEquipment,
      inspections: [
        {
          id: 'in-1',
          equipmentId: 'eq-1',
          inspectorId: 'user-1',
          templateId: null,
          status: InspectionStatus.pass,
          notes: null,
          createdAt: new Date(),
        },
      ],
      certifications: [],
      activeLockout: null,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('applies lockout penalty', () => {
    const locked = conditionScoringEngine.compute({
      equipment: { ...baseEquipment, status: 'locked_out' },
      inspections: [],
      certifications: [],
      activeLockout: {
        id: 'lo-1',
        equipmentId: 'eq-1',
        reason: 'fault',
        lockedBy: 'user-1',
        lockedAt: new Date(),
        unlockedBy: null,
        unlockedAt: null,
        active: true,
      },
    });
    const unlocked = conditionScoringEngine.compute({
      equipment: baseEquipment,
      inspections: [],
      certifications: [],
      activeLockout: null,
    });
    expect(locked.score).toBeLessThan(unlocked.score);
  });
});

describe('lockout engine', () => {
  it('resolves status after unlock based on score', () => {
    expect(lockoutEngine.resolveStatusAfterUnlock(85)).toBe('active');
    expect(lockoutEngine.resolveStatusAfterUnlock(55)).toBe('maintenance');
    expect(lockoutEngine.resolveStatusAfterUnlock(30)).toBe('out_of_service');
  });
});

describe('inspection schedule engine', () => {
  it('computes next due date', () => {
    const from = new Date('2026-06-15T12:00:00.000Z');
    const next = inspectionScheduleEngine.computeNextDue(from, 90);
    const diffDays = Math.round((next.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(90);
  });
});

describe('authorization helper', () => {
  it('detects expired authorization', () => {
    const active = isAuthorizationActive(
      { status: AuthorizationStatus.active, expiryDate: new Date('2030-01-01') },
      new Date('2026-01-01'),
    );
    const expired = isAuthorizationActive(
      { status: AuthorizationStatus.active, expiryDate: new Date('2020-01-01') },
      new Date('2026-01-01'),
    );
    expect(active).toBe(true);
    expect(expired).toBe(false);
  });
});
