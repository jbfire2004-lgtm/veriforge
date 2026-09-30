import { describe, it, expect } from 'vitest';
import { priorityEngine } from '../../src/engines/priority.engine';

describe('priority engine', () => {
  it('elevates SIF-linked to critical', () => {
    const r = priorityEngine.compute({
      severity: 'medium',
      actionType: 'permanent',
      sifLinked: true,
    });
    expect(r.priority).toBe('critical');
  });

  it('routine medium priority', () => {
    const r = priorityEngine.compute({
      severity: 'medium',
      actionType: 'permanent',
    });
    expect(r.priority).toBe('medium');
    expect(r.dueDate).toBeInstanceOf(Date);
  });
});
