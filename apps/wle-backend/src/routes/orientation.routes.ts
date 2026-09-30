import { Router } from "express";
import { OrientationController } from "../controllers/orientation.controller";

const router = Router();

router.post("/complete", OrientationController.completeOrientation);
router.post("/expire/:workerId", OrientationController.expireOrientation);

export default router;
