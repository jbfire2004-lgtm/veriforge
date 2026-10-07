export type ScheduleSlot = {
  id?: string;
  workerId?: number | null;
  equipmentId?: number | null;
  taskId?: string | null;
  startAt: Date;
  endAt: Date;
};

export type ScheduleConflict = {
  slotA: string;
  slotB: string;
  reason: string;
  resource: 'worker' | 'equipment' | 'task';
};

export class SchedulingEngine {
  overlaps(a: ScheduleSlot, b: ScheduleSlot): boolean {
    return a.startAt < b.endAt && b.startAt < a.endAt;
  }

  detectConflicts(slots: ScheduleSlot[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (!this.overlaps(a, b)) continue;

        if (a.workerId && b.workerId && a.workerId === b.workerId) {
          conflicts.push({
            slotA: a.id ?? `i${i}`,
            slotB: b.id ?? `i${j}`,
            reason: `Worker ${a.workerId} double-booked`,
            resource: 'worker',
          });
        }
        if (a.equipmentId && b.equipmentId && a.equipmentId === b.equipmentId) {
          conflicts.push({
            slotA: a.id ?? `i${i}`,
            slotB: b.id ?? `i${j}`,
            reason: `Equipment ${a.equipmentId} double-booked`,
            resource: 'equipment',
          });
        }
        if (a.taskId && b.taskId && a.taskId === b.taskId) {
          conflicts.push({
            slotA: a.id ?? `i${i}`,
            slotB: b.id ?? `i${j}`,
            reason: `Task ${a.taskId} has overlapping schedule entries`,
            resource: 'task',
          });
        }
      }
    }
    return conflicts;
  }
}
