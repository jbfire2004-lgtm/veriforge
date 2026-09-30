import { env } from '../config/env';
import { ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { actionFromMethod } from '../utils/http-method-action';

export interface EvaluateParams {
  token: string;
  userId: string;
  companyId: string;
  resource: string;
  action: string;
}

export const rbacEvaluation = {
  async evaluate(params: EvaluateParams): Promise<{ allow: boolean; reason: string }> {
    if (!env.rbacEnabled) {
      return { allow: true, reason: 'RBAC enforcement disabled' };
    }

    const url = `${env.rbacServiceUrl}${env.rbacEvaluatePath}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
        body: JSON.stringify({
          user_id: params.userId,
          company_id: params.companyId,
          resource: params.resource,
          action: params.action,
        }),
        signal: AbortSignal.timeout(5000),
      });

      const body = (await res.json()) as { allow?: boolean; reason?: string };

      if (!res.ok) {
        logger.warn('rbac evaluate error', { status: res.status, body });
        throw new ForbiddenError(body.reason ?? 'Permission denied');
      }

      if (!body.allow) {
        throw new ForbiddenError(body.reason ?? 'Permission denied');
      }

      return { allow: true, reason: body.reason ?? 'Allowed' };
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      logger.error('rbac service unreachable', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw new ForbiddenError('RBAC service unavailable');
    }
  },

  evaluateFromRequest(
    token: string,
    userId: string,
    companyId: string,
    resource: string,
    method: string,
  ) {
    return this.evaluate({
      token,
      userId,
      companyId,
      resource,
      action: actionFromMethod(method),
    });
  },
};
