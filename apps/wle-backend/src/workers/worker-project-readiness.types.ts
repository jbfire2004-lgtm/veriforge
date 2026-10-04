export type WorkerProjectReadinessStatus =
  | 'READY'
  | 'RESTRICTED'
  | 'NOT QUALIFIED';

/** Primary output — structured JSON for supervisors and access control. */
export type WorkerProjectReadinessJson = {
  status: WorkerProjectReadinessStatus;
  blocking_items: string[];
  non_blocking_items: string[];
  fix_steps: string[];
  supervisor_message: string;
};

export type WorkerProjectReadinessResult = WorkerProjectReadinessJson & {
  readiness_id: string;
  worker_id: number;
  project_id: number;
  evaluated_at: string;
  contractor_prequalification: {
    required: boolean;
    status: 'approved' | 'conditional' | 'rejected' | 'not_applicable';
    company_name?: string;
  };
  orientation: {
    current: boolean;
    blocking_packages: string[];
  };
  training_summary: {
    required: number;
    valid_verified: number;
    expired: number;
    missing: number;
    unverified: number;
    expiring_soon: number;
  };
};
