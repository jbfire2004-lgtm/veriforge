"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulingEngine = exports.SchedulingEngine = void 0;
class SchedulingEngine {
    overlaps(a, b) {
        return a.startTime < b.endTime && b.startTime < a.endTime;
    }
    detectConflicts(slots) {
        const conflicts = [];
        for (let i = 0; i < slots.length; i++) {
            for (let j = i + 1; j < slots.length; j++) {
                const a = slots[i];
                const b = slots[j];
                if (!this.overlaps(a, b))
                    continue;
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
exports.SchedulingEngine = SchedulingEngine;
exports.schedulingEngine = new SchedulingEngine();
