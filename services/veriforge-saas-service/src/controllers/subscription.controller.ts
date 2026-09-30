import type { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const subscriptionController = {
  getModules: asyncHandler(async (req, res) => {
    const view = await subscriptionService.getModulesView(req.auth!.org_id);
    res.json(view);
  }),

  updateModules: asyncHandler(async (req, res) => {
    const view = await subscriptionService.updateModules(
      req.auth!.org_id,
      req.body.modules,
      req.auth!.user_id,
    );
    res.json(view);
  }),

  getBilling: asyncHandler(async (req, res) => {
    const billing = await subscriptionService.getBilling(req.auth!.org_id);
    res.json(billing);
  }),

  updateBilling: asyncHandler(async (req, res) => {
    const billing = await subscriptionService.updateBilling(
      req.auth!.org_id,
      {
        billingPlan: req.body.billingPlan,
        billingStatus: req.body.billingStatus,
        billingCycle: req.body.billingCycle,
      },
      req.auth!.user_id,
    );
    res.json(billing);
  }),
};
