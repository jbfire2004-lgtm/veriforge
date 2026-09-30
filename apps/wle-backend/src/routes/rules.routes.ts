import { Router } from "express";
import { RulesController } from "../controllers/rules.controller";

const router = Router();

router.get("/", RulesController.getRules);
router.post("/", RulesController.updateRules);

export default router;
