export type VerificationStatus = 'ok' | 'error';

export interface BaseVerificationResponse {
  status: VerificationStatus;
  type: string;
  message?: string;
}

export interface WorkerVerificationResponse extends BaseVerificationResponse {
  type: 'worker';
  worker: any; // you can replace `any` with your Prisma Worker type
}

export interface CompanyVerificationResponse extends BaseVerificationResponse {
  type: 'company';
  company: any;
}

export interface TrainingVerificationResponse extends BaseVerificationResponse {
  type: 'training';
  record: any;
}

export interface CertVerificationResponse extends BaseVerificationResponse {
  type: 'cert';
  cert: any;
}

export interface SiteAccessVerificationResponse
  extends BaseVerificationResponse {
  type: 'site-access';
  access: any;
}

export interface EquipmentVerificationResponse
  extends BaseVerificationResponse {
  type: 'equipment';
  equipment: any;
}

export interface CombinedVerificationResponse extends BaseVerificationResponse {
  type: 'combined';
  worker: any;
  trainings: any[];
  siteAccess: any[];
}

export interface QrVerificationResponse extends BaseVerificationResponse {
  type: 'qr';
  worker?: any;
}

export interface SupervisorScanResponse extends BaseVerificationResponse {
  type: 'supervisor-scan';
  worker: {
    id: number | null | undefined;
    name: string | null | undefined;
    company: string | null | undefined;
  };
  latestTraining: any | null;
}

export interface MobileVerificationResponse {
  id: number | null | undefined;
  name: string | null | undefined;
  valid: boolean;
}
