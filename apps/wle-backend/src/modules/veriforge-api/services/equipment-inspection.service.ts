import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type EquipmentStatus = 'active' | 'maintenance' | 'out_of_service' | 'overdue';
export type InspectionScheduleStatus = 'scheduled' | 'due' | 'overdue' | 'completed';
export type ChecklistResult = 'pass' | 'fail' | 'na' | 'pending';
export type DefectSeverity = 'critical' | 'major' | 'minor';
export type CertStatus = 'valid' | 'expiring' | 'expired';

export type EquipmentRecord = {
  id: string;
  name: string;
  type: string;
  serial: string;
  location: string;
  status: EquipmentStatus;
  lastInspectionAt: string | null;
  nextInspectionAt: string;
  timestamp: string;
  userId: number;
};

export type InspectionSchedule = {
  id: string;
  equipmentId: string;
  title: string;
  dueAt: string;
  status: InspectionScheduleStatus;
  assignee: string;
  timestamp: string;
  userId: number;
};

export type ChecklistItem = {
  id: string;
  label: string;
  result: ChecklistResult;
};

export type InspectionRecord = {
  id: string;
  equipmentId: string;
  scheduleId: string | null;
  title: string;
  checklist: ChecklistItem[];
  score: number;
  completionPercent: number;
  status: 'in_progress' | 'completed' | 'failed';
  maintenanceLinked: boolean;
  timestamp: string;
  userId: number;
};

export type DefectRecord = {
  id: string;
  equipmentId: string;
  inspectionId: string | null;
  defectType: string;
  severity: DefectSeverity;
  description: string;
  photoName: string | null;
  status: 'open' | 'linked' | 'closed';
  timestamp: string;
  userId: number;
};

export type CertificationRecord = {
  id: string;
  equipmentId: string;
  name: string;
  issuer: string;
  expiresAt: string;
  status: CertStatus;
  timestamp: string;
  userId: number;
};

export type InspectionAnalytics = {
  totalEquipment: number;
  overdueInspections: number;
  averageScore: number;
  averageCompletion: number;
  criticalDefects: number;
  openDefects: number;
  expiredCerts: number;
  maintenanceLinked: number;
  defectFrequency: number;
  timestamp: string;
  userId: number | null;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function certStatus(expiresAt: string): CertStatus {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  if (expires < now) return 'expired';
  if (expires < now + 30 * 86400000) return 'expiring';
  return 'valid';
}

function scoreFromChecklist(checklist: ChecklistItem[]) {
  const scored = checklist.filter((item) => item.result === 'pass' || item.result === 'fail');
  if (scored.length === 0) return 0;
  const passed = scored.filter((item) => item.result === 'pass').length;
  return clamp((passed / scored.length) * 100);
}

function completionFromChecklist(checklist: ChecklistItem[]) {
  if (checklist.length === 0) return 0;
  const done = checklist.filter((item) => item.result !== 'pending').length;
  return clamp((done / checklist.length) * 100);
}

@Injectable()
export class EquipmentInspectionService {
  private equipmentSeq = 3;
  private scheduleSeq = 3;
  private inspectionSeq = 2;
  private defectSeq = 3;
  private certSeq = 3;
  private checkSeq = 20;

  private equipment: EquipmentRecord[] = [];
  private schedules: InspectionSchedule[] = [];
  private inspections: InspectionRecord[] = [];
  private defects: DefectRecord[] = [];
  private certifications: CertificationRecord[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.equipment = [
      {
        id: 'eq-1',
        name: 'Overhead Crane A',
        type: 'crane',
        serial: 'CRN-4401',
        location: 'Bay 4',
        status: 'overdue',
        lastInspectionAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        nextInspectionAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: 'eq-2',
        name: 'Hydraulic Press B',
        type: 'press',
        serial: 'PRS-2208',
        location: 'Cell B',
        status: 'active',
        lastInspectionAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        nextInspectionAt: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
    ];
    this.schedules = [
      {
        id: 'sch-1',
        equipmentId: 'eq-1',
        title: 'Monthly crane inspection',
        dueAt: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
        status: 'overdue',
        assignee: 'M. Ortega',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'sch-2',
        equipmentId: 'eq-2',
        title: 'Quarterly press inspection',
        dueAt: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
        status: 'scheduled',
        assignee: 'S. Kim',
        timestamp: now,
        userId: 1,
      },
    ];
    this.inspections = [
      {
        id: 'insp-1',
        equipmentId: 'eq-1',
        scheduleId: 'sch-1',
        title: 'Crane A monthly',
        checklist: [
          { id: 'chk-1', label: 'Wire rope condition', result: 'fail' },
          { id: 'chk-2', label: 'Limit switch function', result: 'pass' },
          { id: 'chk-3', label: 'Hook latch integrity', result: 'pending' },
          { id: 'chk-4', label: 'Emergency stop', result: 'pass' },
        ],
        score: 67,
        completionPercent: 75,
        status: 'in_progress',
        maintenanceLinked: false,
        timestamp: now,
        userId: 1,
      },
    ];
    this.recalculateInspection(this.inspections[0]);
    this.defects = [
      {
        id: 'def-1',
        equipmentId: 'eq-1',
        inspectionId: 'insp-1',
        defectType: 'Wire rope fray',
        severity: 'critical',
        description: 'Visible broken strands on hoist rope near drum.',
        photoName: 'crane-rope.jpg',
        status: 'open',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'def-2',
        equipmentId: 'eq-2',
        inspectionId: null,
        defectType: 'Guard misalignment',
        severity: 'minor',
        description: 'Side guard sits 4mm off datum.',
        photoName: null,
        status: 'open',
        timestamp: now,
        userId: 1,
      },
    ];
    this.certifications = [
      {
        id: 'cert-1',
        equipmentId: 'eq-1',
        name: 'Load Test Certificate',
        issuer: 'ForgeCert Labs',
        expiresAt: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
        status: 'expired',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'cert-2',
        equipmentId: 'eq-2',
        name: 'Pressure Vessel Cert',
        issuer: 'Alloy Inspect Co',
        expiresAt: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
        status: 'valid',
        timestamp: now,
        userId: 1,
      },
    ];
    this.refreshCertStatuses();
    this.notifyCritical(this.defects[0]);
    this.notifyExpiredCert(this.certifications[0]);
  }

  overview() {
    this.refreshEquipmentStatuses();
    this.refreshCertStatuses();
    return {
      equipment: this.equipment,
      schedules: this.schedules,
      inspections: this.inspections,
      defects: this.defects,
      certifications: this.certifications,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): InspectionAnalytics {
    this.refreshEquipmentStatuses();
    this.refreshCertStatuses();
    const overdueInspections = this.schedules.filter((s) => s.status === 'overdue').length;
    const averageScore =
      this.inspections.length === 0
        ? 0
        : Math.round(
            this.inspections.reduce((sum, i) => sum + i.score, 0) /
              this.inspections.length,
          );
    const averageCompletion =
      this.inspections.length === 0
        ? 0
        : Math.round(
            this.inspections.reduce((sum, i) => sum + i.completionPercent, 0) /
              this.inspections.length,
          );
    return {
      totalEquipment: this.equipment.length,
      overdueInspections,
      averageScore,
      averageCompletion,
      criticalDefects: this.defects.filter((d) => d.severity === 'critical').length,
      openDefects: this.defects.filter((d) => d.status === 'open').length,
      expiredCerts: this.certifications.filter((c) => c.status === 'expired').length,
      maintenanceLinked: this.inspections.filter((i) => i.maintenanceLinked).length,
      defectFrequency: this.defects.length,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  registerEquipment(
    input: {
      name: string;
      type: string;
      serial: string;
      location: string;
      nextInspectionAt?: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const next =
      input.nextInspectionAt ??
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const overdue = new Date(next).getTime() < Date.now();
    const item: EquipmentRecord = {
      id: `eq-${this.equipmentSeq++}`,
      name: input.name,
      type: input.type,
      serial: input.serial,
      location: input.location,
      status: overdue ? 'overdue' : 'active',
      lastInspectionAt: null,
      nextInspectionAt: next,
      timestamp: now,
      userId,
    };
    this.equipment.unshift(item);
    return item;
  }

  scheduleInspection(
    input: {
      equipmentId: string;
      title: string;
      dueAt: string;
      assignee: string;
    },
    userId: number,
  ) {
    this.getEquipment(input.equipmentId);
    const overdue = new Date(input.dueAt).getTime() < Date.now();
    const item: InspectionSchedule = {
      id: `sch-${this.scheduleSeq++}`,
      equipmentId: input.equipmentId,
      title: input.title,
      dueAt: input.dueAt,
      status: overdue ? 'overdue' : 'scheduled',
      assignee: input.assignee,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.schedules.unshift(item);
    if (overdue) {
      const eq = this.getEquipment(input.equipmentId);
      eq.status = 'overdue';
      this.notifications.enqueue({
        category: 'compliance',
        title: 'INSPECTION OVERDUE',
        message: `${item.title} for ${eq.name} is overdue.`,
        forgeStatus: 'failed',
      });
    }
    return item;
  }

  startInspection(
    input: {
      equipmentId: string;
      scheduleId?: string | null;
      title: string;
      checklistLabels?: string[];
    },
    userId: number,
  ) {
    this.getEquipment(input.equipmentId);
    const labels =
      input.checklistLabels?.length
        ? input.checklistLabels
        : [
            'Structural integrity',
            'Safety devices',
            'Guarding',
            'Controls & E-stop',
            'Labels & certifications',
          ];
    const checklist: ChecklistItem[] = labels.map((label) => ({
      id: `chk-${this.checkSeq++}`,
      label,
      result: 'pending',
    }));
    const item: InspectionRecord = {
      id: `insp-${this.inspectionSeq++}`,
      equipmentId: input.equipmentId,
      scheduleId: input.scheduleId ?? null,
      title: input.title,
      checklist,
      score: 0,
      completionPercent: 0,
      status: 'in_progress',
      maintenanceLinked: false,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.inspections.unshift(item);
    return item;
  }

  setChecklistResult(
    inspectionId: string,
    itemId: string,
    result: ChecklistResult,
    userId: number,
  ) {
    const inspection = this.getInspection(inspectionId);
    const item = inspection.checklist.find((row) => row.id === itemId);
    if (!item) throw new NotFoundException(`Checklist item ${itemId} not found`);
    item.result = result;
    inspection.userId = userId;
    this.recalculateInspection(inspection);
    return inspection;
  }

  reportDefect(
    input: {
      equipmentId: string;
      inspectionId?: string | null;
      defectType: string;
      severity: DefectSeverity;
      description: string;
      photoName?: string | null;
    },
    userId: number,
  ) {
    this.getEquipment(input.equipmentId);
    const item: DefectRecord = {
      id: `def-${this.defectSeq++}`,
      equipmentId: input.equipmentId,
      inspectionId: input.inspectionId ?? null,
      defectType: input.defectType,
      severity: input.severity,
      description: input.description,
      photoName: input.photoName ?? null,
      status: 'open',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.defects.unshift(item);
    this.notifyCritical(item);
    return item;
  }

  addCertification(
    input: {
      equipmentId: string;
      name: string;
      issuer: string;
      expiresAt: string;
    },
    userId: number,
  ) {
    this.getEquipment(input.equipmentId);
    const item: CertificationRecord = {
      id: `cert-${this.certSeq++}`,
      equipmentId: input.equipmentId,
      name: input.name,
      issuer: input.issuer,
      expiresAt: input.expiresAt,
      status: certStatus(input.expiresAt),
      timestamp: new Date().toISOString(),
      userId,
    };
    this.certifications.unshift(item);
    if (item.status === 'expired') this.notifyExpiredCert(item);
    return item;
  }

  linkMaintenance(inspectionId: string, userId: number) {
    const inspection = this.getInspection(inspectionId);
    inspection.maintenanceLinked = true;
    inspection.userId = userId;
    const eq = this.getEquipment(inspection.equipmentId);
    eq.status = 'maintenance';
    for (const defect of this.defects.filter(
      (d) => d.inspectionId === inspectionId && d.status === 'open',
    )) {
      defect.status = 'linked';
    }
    return inspection;
  }

  completeInspection(inspectionId: string, userId: number) {
    const inspection = this.getInspection(inspectionId);
    for (const item of inspection.checklist) {
      if (item.result === 'pending') item.result = 'na';
    }
    this.recalculateInspection(inspection);
    inspection.status = inspection.score < 70 ? 'failed' : 'completed';
    inspection.userId = userId;
    const eq = this.getEquipment(inspection.equipmentId);
    eq.lastInspectionAt = new Date().toISOString();
    eq.nextInspectionAt = new Date(Date.now() + 30 * 86400000)
      .toISOString()
      .slice(0, 10);
    if (eq.status === 'overdue') eq.status = 'active';
    if (inspection.scheduleId) {
      const schedule = this.schedules.find((s) => s.id === inspection.scheduleId);
      if (schedule) schedule.status = 'completed';
    }
    return inspection;
  }

  private getEquipment(id: string) {
    const item = this.equipment.find((e) => e.id === id);
    if (!item) throw new NotFoundException(`Equipment ${id} not found`);
    return item;
  }

  private getInspection(id: string) {
    const item = this.inspections.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Inspection ${id} not found`);
    return item;
  }

  private recalculateInspection(inspection: InspectionRecord) {
    inspection.score = scoreFromChecklist(inspection.checklist);
    inspection.completionPercent = completionFromChecklist(inspection.checklist);
    if (inspection.completionPercent >= 100) {
      inspection.status = inspection.score < 70 ? 'failed' : 'completed';
    }
  }

  private refreshEquipmentStatuses() {
    for (const eq of this.equipment) {
      if (eq.status === 'out_of_service' || eq.status === 'maintenance') continue;
      const overdue = new Date(eq.nextInspectionAt).getTime() < Date.now();
      eq.status = overdue ? 'overdue' : 'active';
    }
    for (const schedule of this.schedules) {
      if (schedule.status === 'completed') continue;
      schedule.status =
        new Date(schedule.dueAt).getTime() < Date.now() ? 'overdue' : 'scheduled';
    }
  }

  private refreshCertStatuses() {
    for (const cert of this.certifications) {
      cert.status = certStatus(cert.expiresAt);
    }
  }

  private notifyCritical(defect: DefectRecord) {
    if (defect.severity !== 'critical') return;
    const eq = this.equipment.find((e) => e.id === defect.equipmentId);
    this.notifications.enqueue({
      category: 'compliance',
      title: 'CRITICAL DEFECT',
      message: `${defect.defectType} on ${eq?.name ?? defect.equipmentId}: ${defect.description}`,
      forgeStatus: 'failed',
    });
  }

  private notifyExpiredCert(cert: CertificationRecord) {
    const eq = this.equipment.find((e) => e.id === cert.equipmentId);
    this.notifications.enqueue({
      category: 'compliance',
      title: 'CERTIFICATION EXPIRED',
      message: `${cert.name} for ${eq?.name ?? cert.equipmentId} expired.`,
      forgeStatus: 'failed',
    });
  }
}
