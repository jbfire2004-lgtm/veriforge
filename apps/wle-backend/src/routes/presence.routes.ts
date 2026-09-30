import { Router } from "express";
import { PresenceController } from "../controllers/presence.controller";

const router = Router();

router.post("/scan", PresenceController.scan);
router.get("/worker/:id", PresenceController.getWorkerPresence);
router.get("/point/:id", PresenceController.getPresenceAtPoint);

export default router;
