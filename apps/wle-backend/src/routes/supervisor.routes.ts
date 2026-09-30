import { Router } from "express";
import { SupervisorController } from "../controllers/supervisor.controller";

const router = Router();

router.get("/requests", SupervisorController.getRequests);
router.post("/requests/:id/respond", SupervisorController.respondToRequest);

export default router;
