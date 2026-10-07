import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type TaskStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';
export type HazardRisk = 'critical' | 'high' | 'moderate' | 'low';
export type CheckInStatus = 'checked_in' | 'missed' | 'due';
export type InspectionStatus = 'current' | 'due' | 'overdue';
export type ForgeCheckStatus = 'Pass' | 'Fail' | 'Pending';
export type ZoneTone = 'restricted' | 'active' | 'neutral';

export type FieldTask = {
  id: string;
  name: string;
  location: string;
  hazards: string;
  equipment: string;
  dueAt: string;
  status: TaskStatus;
  completionPercent: number;
  lat: number;
  lng: number;
  timestamp: string;
  userId: number;
};

export type FieldCheckIn = {
  id: string;
  taskId: string;
  location: string;
  lat: number;
  lng: number;
  status: CheckInStatus;
  timestamp: string;
  userId: number;
};

export type FieldHazard = {
  id: string;
  taskId: string | null;
  name: string;
  risk: HazardRisk;
  location: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  userId: number;
};

export type FieldEquipment = {
  id: string;
  taskId: string | null;
  type: string;
  serial: string;
  inspectionStatus: InspectionStatus;
  usageHours: number;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldVerification = {
  id: string;
  taskId: string;
  forgeStatus: ForgeCheckStatus;
  notes: string;
  location: string;
  timestamp: string;
  userId: number;
};

export type MapZone = {
  id: string;
  name: string;
  tone: ZoneTone;
  lat: number;
  lng: number;
  location: string;
  timestamp: string;
  userId: number;
};

export type MapRoute = {
  id: string;
  name: string;
  fromZone: string;
  toZone: string;
  restricted: boolean;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldLog = {
  id: string;
  taskId: string | null;
  message: string;
  location: string;
  timestamp: string;
  userId: number;
};

export type FieldAnalytics = {
  totalTasks: number;
  overdueTasks: number;
  taskCompletion: number;
  missedCheckIns: number;
  criticalHazards: number;
  hazardFrequency: number;
  equipmentUsageHours: number;
  overdueInspections: number;
  verificationPassRate: number;
  fieldStatusScore: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class FieldOperationsService {
  private taskSeq = 3;
  private checkSeq = 4;
  private hazardSeq = 5;
  private equipSeq = 4;
  private verifySeq = 3;
  private zoneSeq = 4;
  private routeSeq = 4;
  private logSeq = 6;

  private tasks: FieldTask[] = [];
  private checkIns: FieldCheckIn[] = [];
  private hazards: FieldHazard[] = [];
  private equipment: FieldEquipment[] = [];
  private verifications: FieldVerification[] = [];
  private zones: MapZone[] = [];
  private routes: MapRoute[] = [];
  private logs: FieldLog[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.tasks = [
      {
        id: 'ft-1',
        name: 'Furnace seal inspection',
        location: 'Bay 2 Hot Zone',
        hazards: 'Heat, sparks',
        equipment: 'Thermal camera TC-9',
        dueAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        status: 'in_progress',
        completionPercent: 45,
        lat: 39.742,
        lng: -104.991,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ft-2',
        name: 'Crane path clear',
        location: 'Yard North',
        hazards: 'Overhead lift',
        equipment: 'Radio pack RP-2',
        dueAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'overdue',
        completionPercent: 20,
        lat: 39.745,
        lng: -104.988,
        timestamp: now,
        userId: 1,
      },
    ];

    this.checkIns = [
      {
        id: 'ci-1',
        taskId: 'ft-1',
        location: 'Bay 2 Hot Zone',
        lat: 39.7421,
        lng: -104.9912,
        status: 'checked_in',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ci-2',
        taskId: 'ft-2',
        location: 'Yard North',
        lat: 39.745,
        lng: -104.988,
        status: 'missed',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        userId: 1,
      },
      {
        id: 'ci-3',
        taskId: 'ft-1',
        location: 'Bay 2 Hot Zone',
        lat: 39.742,
        lng: -104.991,
        status: 'due',
        timestamp: now,
        userId: 1,
      },
    ];

    this.hazards = [
      {
        id: 'fh-1',
        taskId: 'ft-1',
        name: 'Molten splash corridor',
        risk: 'critical',
        location: 'Bay 2 Hot Zone',
        description: 'Active pour window',
        lat: 39.7422,
        lng: -104.9914,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fh-2',
        taskId: 'ft-2',
        name: 'Swing radius',
        risk: 'high',
        location: 'Yard North',
        description: 'Crane boom arc',
        lat: 39.7452,
        lng: -104.9882,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fh-3',
        taskId: null,
        name: 'Staging pad',
        risk: 'low',
        location: 'West Pad',
        description: 'Material laydown',
        lat: 39.74,
        lng: -104.995,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fh-4',
        taskId: 'ft-1',
        name: 'Noise exposure',
        risk: 'moderate',
        location: 'Bay 2 Hot Zone',
        description: 'Compressor bank',
        lat: 39.7418,
        lng: -104.9908,
        timestamp: now,
        userId: 1,
      },
    ];

    this.equipment = [
      {
        id: 'fe-1',
        taskId: 'ft-1',
        type: 'Thermal camera',
        serial: 'TC-9',
        inspectionStatus: 'current',
        usageHours: 14,
        location: 'Bay 2 Hot Zone',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fe-2',
        taskId: 'ft-2',
        type: 'Radio pack',
        serial: 'RP-2',
        inspectionStatus: 'overdue',
        usageHours: 38,
        location: 'Yard North',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fe-3',
        taskId: null,
        type: 'Gas monitor',
        serial: 'GM-4',
        inspectionStatus: 'due',
        usageHours: 9,
        location: 'Tool crib',
        timestamp: now,
        userId: 1,
      },
    ];

    this.verifications = [
      {
        id: 'fv-1',
        taskId: 'ft-1',
        forgeStatus: 'Pending',
        notes: 'Awaiting seal photo',
        location: 'Bay 2 Hot Zone',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fv-2',
        taskId: 'ft-2',
        forgeStatus: 'Fail',
        notes: 'Path not cleared',
        location: 'Yard North',
        timestamp: now,
        userId: 1,
      },
    ];

    this.zones = [
      {
        id: 'mz-1',
        name: 'Hot Zone',
        tone: 'restricted',
        lat: 39.742,
        lng: -104.991,
        location: 'Bay 2',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'mz-2',
        name: 'Yard North',
        tone: 'active',
        lat: 39.745,
        lng: -104.988,
        location: 'Yard',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'mz-3',
        name: 'Muster',
        tone: 'neutral',
        lat: 39.739,
        lng: -104.993,
        location: 'Gate A',
        timestamp: now,
        userId: 1,
      },
    ];

    this.routes = [
      {
        id: 'mr-1',
        name: 'Egress Alpha',
        fromZone: 'Hot Zone',
        toZone: 'Muster',
        restricted: false,
        location: 'Bay 2 → Gate A',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'mr-2',
        name: 'Crane underpass',
        fromZone: 'Yard North',
        toZone: 'Hot Zone',
        restricted: true,
        location: 'Yard → Bay 2',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'mr-3',
        name: 'Service lane',
        fromZone: 'Muster',
        toZone: 'Yard North',
        restricted: false,
        location: 'Gate A → Yard',
        timestamp: now,
        userId: 1,
      },
    ];

    this.logs = [
      {
        id: 'fl-1',
        taskId: 'ft-1',
        message: 'Task assigned to field crew',
        location: 'Bay 2 Hot Zone',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fl-2',
        taskId: 'ft-1',
        message: 'Check-in recorded at Bay 2',
        location: 'Bay 2 Hot Zone',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fl-3',
        taskId: 'ft-2',
        message: 'Missed check-in flagged',
        location: 'Yard North',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fl-4',
        taskId: 'ft-1',
        message: 'Critical hazard mapped: molten splash',
        location: 'Bay 2 Hot Zone',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'fl-5',
        taskId: 'ft-2',
        message: 'forgeCheck failed for crane path',
        location: 'Yard North',
        timestamp: now,
        userId: 1,
      },
    ];

    for (const h of this.hazards) {
      if (h.risk === 'critical') this.notifyCriticalHazard(h);
    }
  }

  overview() {
    return {
      tasks: this.tasks,
      checkIns: this.checkIns,
      hazards: this.hazards,
      equipment: this.equipment,
      verifications: this.verifications,
      zones: this.zones,
      routes: this.routes,
      logs: this.logs,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): FieldAnalytics {
    const completed = this.tasks.filter((t) => t.status === 'completed');
    const passed = this.verifications.filter((v) => v.forgeStatus === 'Pass').length;
    const taskCompletion =
      this.tasks.length === 0
        ? 0
        : Math.round(
            this.tasks.reduce((s, t) => s + t.completionPercent, 0) /
              this.tasks.length,
          );
    const criticalHazards = this.hazards.filter((h) => h.risk === 'critical').length;
    const overdueTasks = this.tasks.filter((t) => t.status === 'overdue').length;
    const missedCheckIns = this.checkIns.filter((c) => c.status === 'missed').length;
    const overdueInspections = this.equipment.filter(
      (e) => e.inspectionStatus === 'overdue',
    ).length;
    const fieldStatusScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          taskCompletion * 0.4 +
            (this.verifications.length === 0
              ? 50
              : (passed / this.verifications.length) * 100) *
              0.3 +
            30 -
            criticalHazards * 8 -
            overdueTasks * 6 -
            missedCheckIns * 4 -
            overdueInspections * 5,
        ),
      ),
    );
    return {
      totalTasks: this.tasks.length,
      overdueTasks,
      taskCompletion,
      missedCheckIns,
      criticalHazards,
      hazardFrequency: this.hazards.length,
      equipmentUsageHours: this.equipment.reduce((s, e) => s + e.usageHours, 0),
      overdueInspections,
      verificationPassRate:
        this.verifications.length === 0
          ? 0
          : Math.round((passed / this.verifications.length) * 100),
      fieldStatusScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private getTask(taskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    return task;
  }

  private addLog(
    message: string,
    location: string,
    userId: number,
    taskId: string | null,
  ) {
    this.logs.unshift({
      id: `fl-${this.logSeq++}`,
      taskId,
      message,
      location,
      timestamp: new Date().toISOString(),
      userId,
    });
  }

  assignTask(
    input: {
      name: string;
      location: string;
      hazards: string;
      equipment: string;
      dueAt: string;
      lat?: number;
      lng?: number;
    },
    userId: number,
  ) {
    const overdue = new Date(input.dueAt).getTime() < Date.now();
    const task: FieldTask = {
      id: `ft-${this.taskSeq++}`,
      name: input.name,
      location: input.location,
      hazards: input.hazards,
      equipment: input.equipment,
      dueAt: input.dueAt,
      status: overdue ? 'overdue' : 'assigned',
      completionPercent: 0,
      lat: input.lat ?? 39.74 + Math.random() * 0.01,
      lng: input.lng ?? -104.99 + Math.random() * 0.01,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.tasks.unshift(task);
    this.checkIns.unshift({
      id: `ci-${this.checkSeq++}`,
      taskId: task.id,
      location: task.location,
      lat: task.lat,
      lng: task.lng,
      status: 'due',
      timestamp: new Date().toISOString(),
      userId,
    });
    this.addLog(`Task assigned: ${task.name}`, task.location, userId, task.id);
    return task;
  }

  bumpTask(taskId: string, delta: number, userId: number) {
    const task = this.getTask(taskId);
    task.completionPercent = Math.max(
      0,
      Math.min(100, task.completionPercent + delta),
    );
    task.status =
      task.completionPercent >= 100
        ? 'completed'
        : new Date(task.dueAt).getTime() < Date.now()
          ? 'overdue'
          : task.completionPercent > 0
            ? 'in_progress'
            : 'assigned';
    task.userId = userId;
    task.timestamp = new Date().toISOString();
    this.addLog(
      `Task progress ${task.completionPercent}%`,
      task.location,
      userId,
      task.id,
    );
    return task;
  }

  checkIn(
    input: {
      taskId: string;
      lat?: number;
      lng?: number;
      location?: string;
    },
    userId: number,
  ) {
    const task = this.getTask(input.taskId);
    const row: FieldCheckIn = {
      id: `ci-${this.checkSeq++}`,
      taskId: task.id,
      location: input.location ?? task.location,
      lat: input.lat ?? task.lat,
      lng: input.lng ?? task.lng,
      status: 'checked_in',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.checkIns = this.checkIns.map((c) =>
      c.taskId === task.id && c.status === 'due'
        ? { ...c, status: 'checked_in', timestamp: row.timestamp, userId }
        : c,
    );
    this.checkIns.unshift(row);
    if (task.status === 'assigned') task.status = 'in_progress';
    task.timestamp = new Date().toISOString();
    task.userId = userId;
    this.addLog(
      `Check-in at ${row.lat.toFixed(4)}, ${row.lng.toFixed(4)}`,
      row.location,
      userId,
      task.id,
    );
    return row;
  }

  raiseHazard(
    input: {
      taskId?: string | null;
      name: string;
      risk: HazardRisk;
      location: string;
      description: string;
      lat?: number;
      lng?: number;
    },
    userId: number,
  ) {
    const hazard: FieldHazard = {
      id: `fh-${this.hazardSeq++}`,
      taskId: input.taskId ?? null,
      name: input.name,
      risk: input.risk,
      location: input.location,
      description: input.description,
      lat: input.lat ?? 39.74 + Math.random() * 0.01,
      lng: input.lng ?? -104.99 + Math.random() * 0.01,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.hazards.unshift(hazard);
    if (hazard.risk === 'critical') this.notifyCriticalHazard(hazard);
    this.addLog(
      `Hazard raised: ${hazard.name} (${hazard.risk})`,
      hazard.location,
      userId,
      hazard.taskId,
    );
    return hazard;
  }

  trackEquipment(
    input: {
      taskId?: string | null;
      type: string;
      serial: string;
      inspectionStatus?: InspectionStatus;
      usageHours?: number;
      location: string;
    },
    userId: number,
  ) {
    const row: FieldEquipment = {
      id: `fe-${this.equipSeq++}`,
      taskId: input.taskId ?? null,
      type: input.type,
      serial: input.serial,
      inspectionStatus: input.inspectionStatus ?? 'current',
      usageHours: input.usageHours ?? 1,
      location: input.location,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.equipment.unshift(row);
    if (row.inspectionStatus === 'overdue') {
      this.notifications.enqueue({
        title: 'EQUIPMENT INSPECTION OVERDUE',
        message: `${row.type} ${row.serial} inspection overdue at ${row.location}.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    this.addLog(
      `Equipment tracked: ${row.type} ${row.serial}`,
      row.location,
      userId,
      row.taskId,
    );
    return row;
  }

  bumpEquipmentUsage(equipmentId: string, hours: number, userId: number) {
    const row = this.equipment.find((e) => e.id === equipmentId);
    if (!row) throw new NotFoundException(`Equipment ${equipmentId} not found`);
    row.usageHours += hours;
    row.userId = userId;
    row.timestamp = new Date().toISOString();
    this.addLog(
      `Equipment usage +${hours}h: ${row.serial}`,
      row.location,
      userId,
      row.taskId,
    );
    return row;
  }

  runForgeCheck(taskId: string, userId: number) {
    const task = this.getTask(taskId);
    const relatedHazards = this.hazards.filter((h) => h.taskId === taskId);
    const relatedEquip = this.equipment.filter((e) => e.taskId === taskId);
    const checkedIn = this.checkIns.some(
      (c) => c.taskId === taskId && c.status === 'checked_in',
    );
    const critical = relatedHazards.some((h) => h.risk === 'critical');
    const overdueEquip = relatedEquip.some((e) => e.inspectionStatus === 'overdue');
    const forgeStatus: ForgeCheckStatus =
      checkedIn && !critical && !overdueEquip && task.completionPercent >= 50
        ? 'Pass'
        : !checkedIn || critical || overdueEquip
          ? 'Fail'
          : 'Pending';
    const verification: FieldVerification = {
      id: `fv-${this.verifySeq++}`,
      taskId,
      forgeStatus,
      notes:
        forgeStatus === 'Pass'
          ? 'Field conditions verified'
          : forgeStatus === 'Fail'
            ? 'Failed: check-in, hazard, or equipment issue'
            : 'Pending field evidence',
      location: task.location,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.verifications.unshift(verification);
    if (forgeStatus === 'Fail') {
      this.notifications.enqueue({
        title: 'FIELD FORGECHECK FAILED',
        message: `${task.name} failed field verification at ${task.location}.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    this.addLog(
      `forgeCheck ${forgeStatus} for ${task.name}`,
      task.location,
      userId,
      taskId,
    );
    return verification;
  }

  addZone(
    input: {
      name: string;
      tone: ZoneTone;
      location: string;
      lat?: number;
      lng?: number;
    },
    userId: number,
  ) {
    const zone: MapZone = {
      id: `mz-${this.zoneSeq++}`,
      name: input.name,
      tone: input.tone,
      lat: input.lat ?? 39.74 + Math.random() * 0.01,
      lng: input.lng ?? -104.99 + Math.random() * 0.01,
      location: input.location,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.zones.unshift(zone);
    return zone;
  }

  addRoute(
    input: {
      name: string;
      fromZone: string;
      toZone: string;
      restricted?: boolean;
      location: string;
    },
    userId: number,
  ) {
    const route: MapRoute = {
      id: `mr-${this.routeSeq++}`,
      name: input.name,
      fromZone: input.fromZone,
      toZone: input.toZone,
      restricted: Boolean(input.restricted),
      location: input.location,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.routes.unshift(route);
    return route;
  }

  addLogEntry(
    input: { taskId?: string | null; message: string; location: string },
    userId: number,
  ) {
    this.addLog(input.message, input.location, userId, input.taskId ?? null);
    return this.logs[0];
  }

  private notifyCriticalHazard(hazard: FieldHazard) {
    this.notifications.enqueue({
      title: 'CRITICAL FIELD HAZARD',
      message: `${hazard.name} at ${hazard.location}: ${hazard.description}`,
      category: 'compliance',
      forgeStatus: 'failed',
    });
  }
}
