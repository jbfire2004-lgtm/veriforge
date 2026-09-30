import { apiGet, apiPost } from "@/lib/api";

const walletBase = (equipmentId: number) =>
  `/api/v1/equipment/${equipmentId}/wallet`;

export type EquipmentWalletQr = {
  equipmentId: number;
  equipmentName: string;
  serialNumber: string | null;
  assetTag: string | null;
  qrToken: string;
  qrContent: string;
  scanUrl: string;
  verifyUrl: string;
  walletUrl: string;
};

export type EquipmentWalletInspection = {
  id: number;
  inspectionType: string;
  kind: string;
  passed: boolean | null;
  status: string;
  lockoutTriggered: boolean;
  completedAt: string | null;
  nextInspectionDate: string | null;
  createdAt: string;
  worker?: { id: number; firstName: string; lastName: string };
  checklistName?: string;
};

export type EquipmentWalletCompliance = {
  equipmentId: number;
  complianceStatus: string;
  linkComplianceStatus: string | null;
  lastInspectionAt: string | null;
  nextInspectionAt: string | null;
  lockoutStatus: string;
  lockedOut: boolean;
  lockoutReason: string | null;
  safetyStatus: string;
  competencyRequired: boolean;
  trainingRequired: boolean;
  complianceUpdatedAt: string | null;
  activeCompany?: { id: number; name: string } | null;
  history?: { status: string; assessedAt: string; notes?: string | null }[];
};

export type EquipmentWalletFull = {
  type: "equipment";
  equipment: {
    id: number;
    name: string;
    serialNumber: string | null;
    assetTag: string | null;
    catalogTypeKey: string | null;
    photoUrl: string | null;
  };
  qr: EquipmentWalletQr;
  inspections: EquipmentWalletInspection[];
  competency: {
    competencyRequired: boolean;
    resolvedRules: {
      minPassingScore: number;
      expiryDays: number | null;
      requireEvaluation: boolean;
      source: string;
    };
    assetRequirement: unknown;
    typeRequirement: unknown;
    recentEvaluations: {
      id: number;
      passed: boolean;
      score: number;
      evaluationDate: string;
      expiresAt: string | null;
      worker: { id: number; firstName: string; lastName: string };
    }[];
  };
  assignedWorkers: {
    equipmentLinkId: number;
    companyId: number;
    companyName: string;
    worker: { id: number; firstName: string; lastName: string; email?: string };
    assignedAt: string;
  }[];
  assignedProjects: {
    id: number;
    projectId: number;
    status: string;
    assignedAt: string;
    endedAt: string | null;
    project: { id: number; name: string; code: string | null; status: string };
  }[];
  compliance: EquipmentWalletCompliance;
  trainingRequirements: { certification: { id: number; name: string; code?: string } }[];
  maintenance?: EquipmentMaintenanceSummary;
};

export type EquipmentMaintenanceSummary = {
  equipmentId: number;
  nextMaintenanceDue: string | null;
  nextCalibrationDue: string | null;
  maintenanceOverdue: boolean;
  calibrationOverdue: boolean;
  maintenanceSchedules: { id: number; type: string; nextDueAt: string | null; intervalDays: number }[];
  calibrationSchedules: { id: number; nextDueAt: string | null; intervalDays: number }[];
  maintenanceRecords: {
    id: number;
    type: string;
    performedAt: string;
    nextDueAt: string | null;
    notes: string | null;
  }[];
  calibrationRecords: {
    id: number;
    passed: boolean;
    calibratedAt: string;
    expiresAt: string | null;
    certificateNumber: string | null;
  }[];
};

export async function getEquipmentWalletFull(equipmentId: number) {
  return apiGet<EquipmentWalletFull>(walletBase(equipmentId));
}

export async function getEquipmentWalletQr(equipmentId: number) {
  return apiGet<EquipmentWalletQr>(`${walletBase(equipmentId)}/qr`);
}

export async function getEquipmentWalletInspections(equipmentId: number) {
  return apiGet<EquipmentWalletInspection[]>(`${walletBase(equipmentId)}/inspections`);
}

export async function getEquipmentWalletCompliance(equipmentId: number) {
  return apiGet<EquipmentWalletCompliance>(`${walletBase(equipmentId)}/compliance`);
}

export async function scanEquipmentQrLink(qrToken: string, companyId: number) {
  return apiPost<{
    linked: boolean;
    equipmentId: number;
    companyId: number;
    linkId: number;
    complianceStatus: string;
    equipmentName: string | null;
    walletUrl: string;
  }>("/api/v1/equipment/scan", { qrToken, companyId });
}
