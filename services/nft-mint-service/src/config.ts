import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4010),
    NODE_ENV: z.string().default("development"),
    RPC_URL: z.string().url(),
    /** Observed read RPC (optional). Falls back to RPC_URL. */
    OBSERVER_RPC_URL: z.string().url().optional(),
    /** env | remote — production forbids hot wallet unless ALLOW_HOT_WALLET=true */
    SIGNER_MODE: z.enum(["env", "remote"]).default("env"),
    PRIVATE_KEY: z.string().optional(),
    REMOTE_SIGNER_URL: z.string().url().optional(),
    REMOTE_SIGNER_TOKEN: z.string().optional(),
    ALLOW_HOT_WALLET: z
      .string()
      .optional()
      .transform((v) => v === "true"),
    TRAINING_CONTRACT_ADDRESS: z.string().min(1),
    WORKFLOW_CONTRACT_ADDRESS: z.string().min(1),
    EQUIPMENT_CONTRACT_ADDRESS: z.string().min(1),
    EXPECTED_CHAIN_ID: z.coerce.number().int().positive().optional(),
    MIN_CONFIRMATIONS: z.coerce.number().int().min(1).default(3),
    TX_RECEIPT_POLL_MS: z.coerce.number().int().positive().default(2_000),
    TX_CONFIRM_TIMEOUT_MS: z.coerce.number().int().positive().default(180_000),
  })
  .superRefine((v, ctx) => {
    const prod = v.NODE_ENV === "production";
    if (v.SIGNER_MODE === "env") {
      if (!v.PRIVATE_KEY || v.PRIVATE_KEY.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PRIVATE_KEY required when SIGNER_MODE=env",
          path: ["PRIVATE_KEY"],
        });
      }
      if (prod && !v.ALLOW_HOT_WALLET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Hot PRIVATE_KEY forbidden in production. Use SIGNER_MODE=remote or set ALLOW_HOT_WALLET=true with HSM-backed key injection.",
          path: ["PRIVATE_KEY"],
        });
      }
    }
    if (v.SIGNER_MODE === "remote" && !v.REMOTE_SIGNER_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "REMOTE_SIGNER_URL required when SIGNER_MODE=remote",
        path: ["REMOTE_SIGNER_URL"],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const config = {
  ...parsed.data,
  observerRpcUrl: parsed.data.OBSERVER_RPC_URL ?? parsed.data.RPC_URL,
};
