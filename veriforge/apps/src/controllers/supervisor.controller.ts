import { Request, Response } from "express";
import { SupervisorConfirmationStatus } from "@prisma/client";
import { z } from "zod";
import { SupervisorService } from "../services/supervisor.service";

const supervisorService = new SupervisorService();

const requestsQuerySchema = z.object({
  supervisorId: z.string().min(1),
});

const respondSchema = z.object({
  status: z.enum(["confirmed_on_site", "not_on_site"]),
});

export const SupervisorController = {
  async getRequests(req: Request, res: Response) {
    const parsed = requestsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "supervisorId query param is required" });
    }

    const requests = await supervisorService.getPendingRequests(parsed.data.supervisorId);
    return res.json(requests);
  },

  async respondToRequest(req: Request, res: Response) {
    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const status =
      parsed.data.status === "confirmed_on_site"
        ? SupervisorConfirmationStatus.confirmed_on_site
        : SupervisorConfirmationStatus.not_on_site;

    try {
      const result = await supervisorService.respondToRequest(req.params.id, status);
      return res.json({ success: true, request: result });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to respond to request",
      });
    }
  },
};
