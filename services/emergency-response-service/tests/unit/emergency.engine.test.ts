import { describe, it, expect } from 'vitest';
import {
  missingWorkerEngine,
  notificationEngine,
  mapLockoutMode,
} from '../../src/engines/emergency.engine';

describe('missing worker engine', () => {
  it('detects workers not checked in', () => {
    const result = missingWorkerEngine.detect({
      expectedRoster: ['w1', 'w2', 'w3'],
      checkedInWorkerIds: ['w1', 'w3'],
    });
    expect(result.missingWorkers).toEqual(['w2']);
    expect(result.attendanceRate).toBe(67);
  });
});

describe('notification engine', () => {
  it('builds emergency message', () => {
    const msg = notificationEngine.buildEmergencyMessage({
      type: 'fire',
      severity: 'critical',
      description: 'Building A',
    });
    expect(msg).toContain('FIRE');
    expect(msg).toContain('Building A');
  });
});

describe('lockout mode mapping', () => {
  it('maps fire to lockdown', () => {
    expect(mapLockoutMode('fire')).toBe('lockdown');
  });

  it('maps evacuation type', () => {
    expect(mapLockoutMode('evacuation')).toBe('evacuation');
  });
});
