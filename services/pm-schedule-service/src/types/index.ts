export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface TaskRequirements {
  requiredSkills?: string[];
  requiredEquipment?: string[];
  requiredTraining?: string[];
  requiredControls?: string[];
  requiredPpe?: string[];
  requiredJha?: string[];
}

export interface SafetyGateContext {
  assignedWorkers?: string[];
  assignedEquipment?: string[];
  workerSkills?: string[];
  completedTraining?: string[];
  appliedControls?: string[];
  confirmedPpe?: string[];
  activeJhaTypes?: string[];
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  taskId: string;
}

export interface ScheduleSlot {
  id?: string;
  workerId?: string | null;
  equipmentId?: string | null;
  taskId?: string | null;
  startTime: Date;
  endTime: Date;
}

export interface ScheduleConflict {
  slotA: string;
  slotB: string;
  reason: string;
  resource: 'worker' | 'equipment' | 'task';
}

export interface DelayPrediction {
  predictionType: string;
  probability?: number;
  predictedDelayHours?: number;
  reason?: string;
  recommendation?: string;
  raw?: unknown;
}

export interface ScheduleEntry {
  id: string;
  companyId: string;
  projectId: string;
  taskId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GanttView {
  projectId: string;
  entries: ScheduleEntry[];
  conflicts: ScheduleConflict[];
  workerLanes: Record<string, ScheduleEntry[]>;
  equipmentLanes: Record<string, ScheduleEntry[]>;
}
