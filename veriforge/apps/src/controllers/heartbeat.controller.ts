import { Request, Response } from "express";
import { z } from "zod";
import { HeartbeatService } from "../services/heartbeat.service";

const service = new HeartbeatService();

const bodySchema = z.object({
  workerId: z.string().min(1),
});

export const HeartbeatController = {
  async registerHeartbeat(req: Request, res: Response) {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const worker = await service.registerHeartbeat(parsed.data.workerId);
    return res.json({ success: true, worker });
  },

  async getLastHeartbeat(req: Request, res: Response) {
    const worker = await service.getLastHeartbeat(req.params.workerId);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    return res.json(worker);
  },
};
