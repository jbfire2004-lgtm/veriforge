import { Request, Response } from "express";
import { z } from "zod";
import { OrientationService } from "../services/orientation.service";

const orientationService = new OrientationService();

const completeSchema = z.object({
  workerId: z.string().min(1),
  date: z.string().datetime(),
});

export const OrientationController = {
  async completeOrientation(req: Request, res: Response) {
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const worker = await orientationService.completeOrientation(
        parsed.data.workerId,
        new Date(parsed.data.date),
      );
      return res.json({ success: true, worker });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete orientation",
      });
    }
  },

  async expireOrientation(req: Request, res: Response) {
    try {
      const worker = await orientationService.expireOrientation(req.params.workerId);
      return res.json({ success: true, worker });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to expire orientation",
      });
    }
  },
};
