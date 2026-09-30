import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "crypto";
import { config } from "./config";
import { mintRouter, normalizeRouteError } from "./routes/mint";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const requestId = randomUUID();
  res.setHeader("x-request-id", requestId);
  (req as Request & { requestId?: string }).requestId = requestId;
  next();
});

app.use((req, _res, next) => {
  const requestId = (req as Request & { requestId?: string }).requestId ?? "unknown";
  console.info(
    JSON.stringify({
      level: "info",
      message: "Incoming request",
      requestId,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    }),
  );
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/mint", mintRouter);

app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const normalized = normalizeRouteError(error);
  const requestId = (req as Request & { requestId?: string }).requestId ?? "unknown";

  console.error(
    JSON.stringify({
      level: "error",
      message: normalized.message,
      requestId,
      method: req.method,
      path: req.path,
      details: "details" in normalized ? normalized.details : undefined,
      timestamp: new Date().toISOString(),
    }),
  );

  res.status(normalized.statusCode).json({
    error: normalized.message,
    requestId,
    ...("details" in normalized ? { details: normalized.details } : {}),
  });
});

app.listen(config.PORT, () => {
  console.info(
    JSON.stringify({
      level: "info",
      message: "nft-mint-service started",
      port: config.PORT,
      timestamp: new Date().toISOString(),
    }),
  );
});
