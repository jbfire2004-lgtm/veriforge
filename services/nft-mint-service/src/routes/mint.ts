import { Router } from "express";
import { ZodError } from "zod";
import { blockchainClient } from "../blockchain/client";
import {
  equipmentMintSchema,
  trainingMintSchema,
  workflowMintSchema,
} from "../types/api";

export const mintRouter = Router();

mintRouter.post("/training", async (req, res, next) => {
  try {
    const payload = trainingMintSchema.parse(req.body);
    const result = await blockchainClient.mintTrainingCredential(
      payload.walletAddress,
      payload.metadata,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

mintRouter.post("/workflow", async (req, res, next) => {
  try {
    const payload = workflowMintSchema.parse(req.body);
    const result = await blockchainClient.mintWorkflow(
      payload.walletAddress,
      payload.metadata,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

mintRouter.post("/equipment", async (req, res, next) => {
  try {
    const payload = equipmentMintSchema.parse(req.body);
    const result = await blockchainClient.mintEquipment(
      payload.walletAddress,
      payload.metadata,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

export function normalizeRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: "Validation failed",
      details: error.flatten(),
    };
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return {
    statusCode: 500,
    message,
  };
}
