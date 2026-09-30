export type OrientationStatus = "valid" | "expired" | "missing";
export type LifecycleState =
  | "active"
  | "inactive"
  | "expired"
  | "missing_docs"
  | "not_seen";
export type CertStatus = "valid" | "expired";

export type Certification = {
  id: string;
  workerId: string;
  type: string;
  expiry: string | null;
  status: CertStatus;
  createdAt: string;
  updatedAt: string;
};

export type HeartbeatEvent = {
  id: string;
  workerId: string;
  createdAt: string;
};

export type Worker = {
  id: string;
  firstName: string;
  lastName: string;
  companyId: string;
  orientationStatus: OrientationStatus;
  orientationDate: string | null;
  lifecycleState: LifecycleState;
  lastHeartbeat: string | null;
  certifications: Certification[];
  heartbeats?: HeartbeatEvent[];
  createdAt: string;
  updatedAt: string;
};

export type ExpiryRules = {
  orientationExpiryDays: number;
  certificationExpiryDays: number;
  notSeenDays: number;
  autoDeactivate: boolean;
  autoNotify: boolean;
};

export type PresencePoint = {
  id: string;
  name: string;
  location: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PresenceLog = {
  id: string;
  workerId: string;
  presencePointId: string;
  scannedAt: string;
  presencePoint: PresencePoint;
};

export type PresenceScanResult = {
  success: boolean;
  pointName: string;
  scannedAt: string;
  logId: string;
};

export type SupervisorConfirmationStatus = "pending" | "confirmed_on_site" | "not_on_site";

export type SupervisorRequest = {
  id: string;
  workerId: string;
  supervisorId: string;
  status: SupervisorConfirmationStatus;
  requestedAt: string;
  respondedAt: string | null;
  worker: Worker;
};
