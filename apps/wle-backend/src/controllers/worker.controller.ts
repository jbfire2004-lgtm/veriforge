import { Request, Response } from "express";
import { LifecycleState, OrientationStatus } from "@prisma/client";
import { z } from "zod";
import { WorkerService } from "../services/worker.service";
import { HeartbeatService } from "../services/heartbeat.service";

const workerService = new WorkerService();
const heartbeatService = new HeartbeatService();

const createWorkerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyId: z.string().min(1),
  orientationStatus: z.nativeEnum(OrientationStatus).optional(),
  orientationDate: z.string().datetime().nullable().optional(),
  lifecycleState: z.nativeEnum(LifecycleState).optional(),
});

const updateWorkerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  companyId: z.string().min(1).optional(),
  orientationStatus: z.nativeEnum(OrientationStatus).optional(),
  orientationDate: z.string().datetime().nullable().optional(),
  lifecycleState: z.nativeEnum(LifecycleState).optional(),
});

const querySchema = z.object({
  lifecycleState: z.nativeEnum(LifecycleState).optional(),
  companyId: z.string().min(1).optional(),
});

export const WorkerController = {
  async getWorkers(req: Request, res: Response) {
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Invalid query params" });
    }
    const workers = await workerService.getAllWorkers(query.data);
    return res.json(workers);
  },

  async getWorkerById(req: Request, res: Response) {
    const worker = await workerService.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    return res.json(worker);
  },

  async createWorker(req: Request, res: Response) {
    const parsed = createWorkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const created = await workerService.createWorker({
      ...parsed.data,
      orientationDate: parsed.data.orientationDate
        ? new Date(parsed.data.orientationDate)
        : null,
    });
    return res.status(201).json(created);
  },

  async updateWorker(req: Request, res: Response) {
    const parsed = updateWorkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const updated = await workerService.updateWorker(req.params.id, {
      ...parsed.data,
      orientationDate:
        parsed.data.orientationDate !== undefined
          ? parsed.data.orientationDate
            ? new Date(parsed.data.orientationDate)
            : null
          : undefined,
    });
    return res.json(updated);
  },

  async deleteWorker(req: Request, res: Response) {
    await workerService.deleteWorker(req.params.id);
    return res.json({ success: true });
  },

  async heartbeat(req: Request, res: Response) {
    const worker = await heartbeatService.registerHeartbeat(req.params.id);
    return res.json(worker);
  },
};
