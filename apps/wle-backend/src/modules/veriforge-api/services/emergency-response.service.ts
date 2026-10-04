import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type EmergencyType =
  | 'fire'
  | 'medical'
  | 'chemical'
  | 'security'
  | 'environmental';

export type EmergencySeverity = 'critical' | 'high' | 'moderate' | 'low';
export type EmergencyStatus =
  | 'active'
  | 'responding'
  | 'contained'
  | 'resolved'
  | 'escalated';

export type ResponseActionType =
  | 'evacuate'
  | 'isolate'
  | 'shut_down'
  | 'notify'
  | 'assist';

export type ResponseActionStatus = 'pending' | 'in_progress' | 'done' | 'critical';
export type MusterStatus = 'safe' | 'missing' | 'en_route';
export type RouteStatus = 'clear' | 'blocked' | 'unsafe';
export type DrillStatus = 'scheduled' | 'ready' | 'overdue' | 'completed';
export type MessagePriority = 'normal' | 'priority';

export type EmergencyAlert = {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  severity: EmergencySeverity;
  location: string;
  status: EmergencyStatus;
  responsePercent: number;
  timestamp: string;
  userId: number;
  updatedAt: string;
};

export type ResponseAction = {
  id: string;
  emergencyId: string;
  action: ResponseActionType;
  label: string;
  status: ResponseActionStatus;
  assignee: string;
  timestamp: string;
  userId: number;
};

export type CommMessage = {
  id: string;
  emergencyId: string;
  sender: string;
  body: string;
  priority: MessagePriority;
  timestamp: string;
  userId: number;
};

export type MusterPerson = {
  id: string;
  name: string;
  musterPoint: string;
  status: MusterStatus;
  timestamp: string;
  userId: number;
};

export type EvacuationRoute = {
  id: string;
  name: string;
  fromZone: string;
  toMuster: string;
  status: RouteStatus;
  timestamp: string;
  userId: number;
};

export type EmergencyDrill = {
  id: string;
  title: string;
  type: EmergencyType;
  scheduledAt: string;
  readiness: number;
  status: DrillStatus;
  timestamp: string;
  userId: number;
};

export type EmergencyAnalytics = {
  activeEmergencies: number;
  criticalCount: number;
  averageResponsePercent: number;
  averageResponseMinutes: number;
  missingPersonnel: number;
  blockedRoutes: number;
  overdueDrills: number;
  drillReadiness: number;
  incidentFrequency: number;
  escalationCount: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class EmergencyResponseService {
  private alertSeq = 2;
  private actionSeq = 5;
  private msgSeq = 3;
  private musterSeq = 5;
  private routeSeq = 4;
  private drillSeq = 3;

  private alerts: EmergencyAlert[] = [];
  private actions: ResponseAction[] = [];
  private messages: CommMessage[] = [];
  private muster: MusterPerson[] = [];
  private routes: EvacuationRoute[] = [];
  private drills: EmergencyDrill[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.alerts = [
      {
        id: 'emg-1',
        type: 'fire',
        title: 'Thermal event · Bay 4',
        description: 'Smoke detected near weld cell fuel staging.',
        severity: 'critical',
        location: 'Bay 4 · Weld Cell',
        status: 'responding',
        responsePercent: 42,
        timestamp: now,
        userId: 1,
        updatedAt: now,
      },
    ];
    this.actions = [
      {
        id: 'act-1',
        emergencyId: 'emg-1',
        action: 'evacuate',
        label: 'Evacuate Bay 4',
        status: 'in_progress',
        assignee: 'Shift Lead',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'act-2',
        emergencyId: 'emg-1',
        action: 'isolate',
        label: 'Isolate fuel line',
        status: 'critical',
        assignee: 'Maintenance',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'act-3',
        emergencyId: 'emg-1',
        action: 'notify',
        label: 'Notify fire brigade',
        status: 'done',
        assignee: 'Control Room',
        timestamp: now,
        userId: 1,
      },
    ];
    this.messages = [
      {
        id: 'msg-1',
        emergencyId: 'emg-1',
        sender: 'Control Room',
        body: 'All crews: proceed to Muster Alpha. Do not re-enter Bay 4.',
        priority: 'priority',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'msg-2',
        emergencyId: 'emg-1',
        sender: 'Shift Lead',
        body: 'Headcount in progress at Alpha. Two unaccounted.',
        priority: 'priority',
        timestamp: now,
        userId: 1,
      },
    ];
    this.muster = [
      {
        id: 'per-1',
        name: 'Jordan Forge',
        musterPoint: 'Muster Alpha',
        status: 'safe',
        timestamp: now,
        userId: 101,
      },
      {
        id: 'per-2',
        name: 'Riley Steel',
        musterPoint: 'Muster Alpha',
        status: 'missing',
        timestamp: now,
        userId: 102,
      },
      {
        id: 'per-3',
        name: 'Sam Ortega',
        musterPoint: 'Muster Bravo',
        status: 'en_route',
        timestamp: now,
        userId: 103,
      },
      {
        id: 'per-4',
        name: 'Kim Vale',
        musterPoint: 'Muster Alpha',
        status: 'safe',
        timestamp: now,
        userId: 104,
      },
    ];
    this.routes = [
      {
        id: 'rte-1',
        name: 'Primary East Egress',
        fromZone: 'Bay 4',
        toMuster: 'Muster Alpha',
        status: 'clear',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'rte-2',
        name: 'North Service Corridor',
        fromZone: 'Bay 4',
        toMuster: 'Muster Bravo',
        status: 'blocked',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'rte-3',
        name: 'Roof Access Stair',
        fromZone: 'Mezzanine',
        toMuster: 'Muster Alpha',
        status: 'unsafe',
        timestamp: now,
        userId: 1,
      },
    ];
    this.drills = [
      {
        id: 'drl-1',
        title: 'Fire Evacuation Drill Q3',
        type: 'fire',
        scheduledAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        readiness: 68,
        status: 'scheduled',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'drl-2',
        title: 'Chemical Spill Response',
        type: 'chemical',
        scheduledAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        readiness: 40,
        status: 'overdue',
        timestamp: now,
        userId: 1,
      },
    ];
    this.notifyCritical(this.alerts[0]);
  }

  overview() {
    return {
      alerts: this.alerts,
      actions: this.actions,
      messages: this.messages,
      muster: this.muster,
      routes: this.routes,
      drills: this.drills,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): EmergencyAnalytics {
    const active = this.alerts.filter(
      (a) => a.status === 'active' || a.status === 'responding' || a.status === 'escalated',
    );
    const criticalCount = this.alerts.filter((a) => a.severity === 'critical').length;
    const averageResponsePercent =
      this.alerts.length === 0
        ? 0
        : Math.round(
            this.alerts.reduce((sum, a) => sum + a.responsePercent, 0) /
              this.alerts.length,
          );
    const missingPersonnel = this.muster.filter((p) => p.status === 'missing').length;
    const blockedRoutes = this.routes.filter(
      (r) => r.status === 'blocked' || r.status === 'unsafe',
    ).length;
    const overdueDrills = this.drills.filter((d) => d.status === 'overdue').length;
    const drillReadiness =
      this.drills.length === 0
        ? 0
        : Math.round(
            this.drills.reduce((sum, d) => sum + d.readiness, 0) / this.drills.length,
          );
    return {
      activeEmergencies: active.length,
      criticalCount,
      averageResponsePercent,
      averageResponseMinutes: Math.max(3, 18 - Math.round(averageResponsePercent / 10)),
      missingPersonnel,
      blockedRoutes,
      overdueDrills,
      drillReadiness,
      incidentFrequency: this.alerts.length,
      escalationCount: this.alerts.filter((a) => a.status === 'escalated').length,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  raiseAlert(
    input: {
      type: EmergencyType;
      title: string;
      description: string;
      severity: EmergencySeverity;
      location: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const alert: EmergencyAlert = {
      id: `emg-${this.alertSeq++}`,
      ...input,
      status: 'active',
      responsePercent: 5,
      timestamp: now,
      userId,
      updatedAt: now,
    };
    this.alerts.unshift(alert);
    this.seedDefaultActions(alert.id, userId, now);
    this.messages.unshift({
      id: `msg-${this.msgSeq++}`,
      emergencyId: alert.id,
      sender: 'System',
      body: `ALERT ${alert.type.toUpperCase()}: ${alert.title} at ${alert.location}. Responders and supervisors notified.`,
      priority: 'priority',
      timestamp: now,
      userId,
    });
    this.notifyCritical(alert);
    return alert;
  }

  updateResponse(
    id: string,
    input: { responsePercent?: number; status?: EmergencyStatus },
    userId: number,
  ) {
    const alert = this.getAlert(id);
    if (input.responsePercent != null) {
      alert.responsePercent = clamp(input.responsePercent);
    }
    if (input.status) alert.status = input.status;
    alert.userId = userId;
    alert.updatedAt = new Date().toISOString();
    return alert;
  }

  escalate(id: string, userId: number) {
    const alert = this.getAlert(id);
    alert.status = 'escalated';
    alert.severity = 'critical';
    alert.userId = userId;
    alert.updatedAt = new Date().toISOString();
    this.messages.unshift({
      id: `msg-${this.msgSeq++}`,
      emergencyId: alert.id,
      sender: 'Escalation Desk',
      body: `ESCALATED: ${alert.title}. Executive and external responders engaged.`,
      priority: 'priority',
      timestamp: new Date().toISOString(),
      userId,
    });
    this.notifyCritical(alert);
    return alert;
  }

  addAction(
    emergencyId: string,
    input: {
      action: ResponseActionType;
      label: string;
      assignee: string;
      status?: ResponseActionStatus;
    },
    userId: number,
  ) {
    this.getAlert(emergencyId);
    const item: ResponseAction = {
      id: `act-${this.actionSeq++}`,
      emergencyId,
      action: input.action,
      label: input.label,
      status: input.status ?? 'pending',
      assignee: input.assignee,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.actions.unshift(item);
    return item;
  }

  completeAction(actionId: string, userId: number) {
    const item = this.actions.find((a) => a.id === actionId);
    if (!item) throw new NotFoundException(`Action ${actionId} not found`);
    item.status = 'done';
    item.userId = userId;
    const alert = this.getAlert(item.emergencyId);
    alert.responsePercent = clamp(alert.responsePercent + 12);
    if (alert.responsePercent >= 100) alert.status = 'contained';
    alert.updatedAt = new Date().toISOString();
    return item;
  }

  postMessage(
    emergencyId: string,
    input: { sender: string; body: string; priority?: MessagePriority },
    userId: number,
  ) {
    this.getAlert(emergencyId);
    const item: CommMessage = {
      id: `msg-${this.msgSeq++}`,
      emergencyId,
      sender: input.sender,
      body: input.body,
      priority: input.priority ?? 'normal',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.messages.unshift(item);
    return item;
  }

  updateMuster(personId: string, status: MusterStatus, userId: number) {
    const person = this.muster.find((p) => p.id === personId);
    if (!person) throw new NotFoundException(`Personnel ${personId} not found`);
    person.status = status;
    person.userId = userId;
    person.timestamp = new Date().toISOString();
    if (status === 'missing') {
      this.notifications.enqueue({
        category: 'system',
        title: 'MUSTER MISSING',
        message: `${person.name} unaccounted at ${person.musterPoint}.`,
        forgeStatus: 'failed',
      });
    }
    return person;
  }

  setRouteStatus(routeId: string, status: RouteStatus, userId: number) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) throw new NotFoundException(`Route ${routeId} not found`);
    route.status = status;
    route.userId = userId;
    route.timestamp = new Date().toISOString();
    return route;
  }

  scheduleDrill(
    input: {
      title: string;
      type: EmergencyType;
      scheduledAt: string;
      readiness?: number;
    },
    userId: number,
  ) {
    const overdue = new Date(input.scheduledAt).getTime() < Date.now();
    const item: EmergencyDrill = {
      id: `drl-${this.drillSeq++}`,
      title: input.title,
      type: input.type,
      scheduledAt: input.scheduledAt,
      readiness: input.readiness ?? 20,
      status: overdue ? 'overdue' : 'scheduled',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.drills.unshift(item);
    if (item.status === 'overdue') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'DRILL OVERDUE',
        message: `${item.title} is overdue.`,
        forgeStatus: 'failed',
      });
    }
    return item;
  }

  bumpDrill(id: string, delta: number, userId: number) {
    const item = this.drills.find((d) => d.id === id);
    if (!item) throw new NotFoundException(`Drill ${id} not found`);
    item.readiness = clamp(item.readiness + delta);
    if (item.readiness >= 100) item.status = 'completed';
    else if (item.status === 'overdue') item.status = 'ready';
    item.userId = userId;
    return item;
  }

  private getAlert(id: string) {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw new NotFoundException(`Emergency ${id} not found`);
    return alert;
  }

  private seedDefaultActions(emergencyId: string, userId: number, timestamp: string) {
    const defaults: Array<{ action: ResponseActionType; label: string; status: ResponseActionStatus }> =
      [
        { action: 'notify', label: 'Notify responders', status: 'done' },
        { action: 'evacuate', label: 'Evacuate zone', status: 'pending' },
        { action: 'isolate', label: 'Isolate hazard', status: 'critical' },
      ];
    for (const row of defaults) {
      this.actions.unshift({
        id: `act-${this.actionSeq++}`,
        emergencyId,
        ...row,
        assignee: 'Response Team',
        timestamp,
        userId,
      });
    }
  }

  private notifyCritical(alert: EmergencyAlert) {
    if (alert.severity !== 'critical' && alert.severity !== 'high') return;
    this.notifications.enqueue({
      category: 'system',
      title: 'CRITICAL EMERGENCY',
      message: `${alert.type.toUpperCase()}: ${alert.title} at ${alert.location}.`,
      forgeStatus: 'failed',
    });
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
