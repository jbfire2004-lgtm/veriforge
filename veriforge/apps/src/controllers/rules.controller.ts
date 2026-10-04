import { Request, Response } from "express";
import { z } from "zod";
import { ExpiryRulesService } from "../services/expiry-rules.service";

const rulesService = new ExpiryRulesService();

const updateRulesSchema = z.object({
  orientationExpiryDays: z.number().int().min(1).max(3650).optional(),
  certificationExpiryDays: z.number().int().min(1).max(3650).optional(),
  notSeenDays: z.number().int().min(1).max(3650).optional(),
  autoDeactivate: z.boolean().optional(),
  autoNotify: z.boolean().optional(),
});

export const RulesController = {
  async getRules(_req: Request, res: Response) {
    const rules = await rulesService.getRules();
    return res.json(rules);
  },

  async updateRules(req: Request, res: Response) {
    const parsed = updateRulesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const rules = await rulesService.updateRules(parsed.data);
    return res.json({ success: true, rules });
  },
};
