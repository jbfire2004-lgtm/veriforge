import express from "express";
import cors from "cors";
import workersRoutes from "./routes/workers.routes";
import rulesRoutes from "./routes/rules.routes";
import heartbeatRoutes from "./routes/heartbeat.routes";
import presenceRoutes from "./routes/presence.routes";
import supervisorRoutes from "./routes/supervisor.routes";
import orientationRoutes from "./routes/orientation.routes";
import { errorMiddleware } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/workers", workersRoutes);
  app.use("/api/rules", rulesRoutes);
  app.use("/api/heartbeat", heartbeatRoutes);
  app.use("/api/presence", presenceRoutes);
  app.use("/api/supervisor", supervisorRoutes);
  app.use("/api/orientation", orientationRoutes);

  app.use(errorMiddleware);
  return app;
}
