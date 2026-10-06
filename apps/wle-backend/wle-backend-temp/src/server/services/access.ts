import { evaluateWorker } from './verification';

export type AccessCheckResult = {
  workerId: number;
  siteId: string;
  allowed: boolean;
  reasons: {
    type: 'MISSING' | 'EXPIRED' | 'EXPIRING_SOON' | 'NO_DOCUMENT';
    courseName: string;
    expiresAt: Date | null;
  }[];
};

export async function canWorkerAccessSite(
  workerId: number,
  siteId: string,
): Promise<AccessCheckResult> {
  // Phase 1: siteId is informational only.
  // Company-level training requirements determine access.

  const verification = await evaluateWorker(workerId);

  // Blocking issues = missing training, expired training, missing documents
  const blocking = verification.issues.filter(
    (i) =>
      i.type === 'MISSING' || i.type === 'EXPIRED' || i.type === 'NO_DOCUMENT',
  );

  return {
    workerId,
    siteId,
    allowed: blocking.length === 0,
    reasons: verification.issues,
  };
}
