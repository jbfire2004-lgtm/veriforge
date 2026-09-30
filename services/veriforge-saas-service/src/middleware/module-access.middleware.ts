import type { ProductModuleCode } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { getProductModule, isProductModuleCode } from '../subscription/product-modules';
import { ModuleAccessDeniedError, UnauthorizedError } from '../utils/errors';

/** Gate routes on a product module from SubscriptionProfile.modules_enabled. */
export function requireSubscriptionModule(moduleCode: ProductModuleCode | string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.org_id) return next(new UnauthorizedError());
    if (!isProductModuleCode(moduleCode)) {
      return next(new ModuleAccessDeniedError(String(moduleCode), String(moduleCode)));
    }

    try {
      const enabled = await subscriptionService.isModuleEnabled(req.auth.org_id, moduleCode);
      if (!enabled) {
        const def = getProductModule(moduleCode);
        return next(new ModuleAccessDeniedError(moduleCode, def.name));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
