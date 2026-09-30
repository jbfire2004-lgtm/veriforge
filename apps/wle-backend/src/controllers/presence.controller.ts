import { Request, Response } from "express";
import { z } from "zod";
import { PresenceService } from "../services/presence.service";

const presenceService = new PresenceService();

const scanSchema = z.object({
  workerId: z.string().min(1),
  code: z.string().min(1),
});

export const PresenceController = {
  async scan(req: Request, res: Response) {
    const parsed = scanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const result = await presenceService.registerScan(parsed.data.workerId, parsed.data.code);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to register scan",
      });
    }
  },

  async getWorkerPresence(req: Request, res: Response) {
    const logs = await presenceService.getWorkerPresence(req.params.id);
    return res.json(logs);
  },

  async getPresenceAtPoint(req: Request, res: Response) {
    const logs = await presenceService.getPresenceAtPoint(req.params.id);
    return res.json(logs);
  },
};
