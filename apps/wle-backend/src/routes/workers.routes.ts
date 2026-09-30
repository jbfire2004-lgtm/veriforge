import { Router } from "express";
import multer from "multer";
import { WorkerController } from "../controllers/worker.controller";
import { ImportExportController } from "../controllers/import-export.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", WorkerController.getWorkers);
router.post("/import", upload.single("file"), ImportExportController.importWorkers);
router.get("/export", ImportExportController.exportWorkers);
router.get("/:id", WorkerController.getWorkerById);
router.post("/", WorkerController.createWorker);
router.put("/:id", WorkerController.updateWorker);
router.delete("/:id", WorkerController.deleteWorker);
router.post("/:id/heartbeat", WorkerController.heartbeat);

export default router;
