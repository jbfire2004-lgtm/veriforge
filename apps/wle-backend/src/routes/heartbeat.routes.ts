import { Router } from "express";
import { HeartbeatController } from "../controllers/heartbeat.controller";

const router = Router();

router.post("/", HeartbeatController.registerHeartbeat);
router.get("/:workerId", HeartbeatController.getLastHeartbeat);

export default router;
