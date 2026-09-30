import { env } from '../config/env';
import { logger } from '../utils/logger';

export const workPackageClient = {
  async verifyWorkPackage(workPackageId: string, companyId: string, token: string): Promise<boolean> {
    if (!env.pmWorkPackageServiceUrl) return true;

    try {
      const res = await fetch(
        `${env.pmWorkPackageServiceUrl}/pm/work-package/${workPackageId}?company_id=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.ok;
    } catch (err) {
      logger.warn('work package service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return true;
    }
  },
};
