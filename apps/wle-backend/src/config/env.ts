import { z } from 'zod';

const booleanish = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v === '') return undefined;
    const t = v.toLowerCase().trim();
    if (['1', 'true', 'yes', 'on'].includes(t)) return true;
    if (['0', 'false', 'no', 'off'].includes(t)) return false;
    return undefined;
  });

/**
 * Validates env before Prisma CLI / seed (`ts-node prisma/seed.ts`).
 * Keeps DATABASE_URL-only so tooling does not require JWT/etc.
 */
const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SEED_USER_PASSWORD: z.string().optional(),
});

const trimUnset = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().optional(),
);

/** Full API process validation (Nest `main.ts`). */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  /** Used by Prisma migrate dev; omit in production-only containers if unused. */
  SHADOW_DATABASE_URL: trimUnset,

  /** JWT signing; insecure default allowed only outside production. */
  JWT_SECRET: trimUnset,
  JWT_ISSUER: trimUnset,
  JWT_AUDIENCE: trimUnset,

  /** API listen port */
  PORT: z.coerce.number().int().positive().optional().default(3001),

  CHAT_SECRET: trimUnset,
  VERA_CORE_UPLOAD_MODE: trimUnset,
  /** Deep links embedded in QR / documents (may be localhost). */
  PUBLIC_BASE_URL: trimUnset,
  /** Absolute base URL clients use when generating links server-side. */
  PUBLIC_API_URL: trimUnset,
  CORS_ORIGIN: trimUnset,
  ENABLE_ORIGIN_GUARD: booleanish.optional(),

  /** When true + production: warn when optional PUBLIC_* URLs missing. */
  VERA_VALIDATE_ENV_STRICT: booleanish.optional(),
  /** Enforce proxy-aware HTTPS checks for API requests. */
  VERA_ENFORCE_HTTPS: booleanish.optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  effectiveJwtSecret: string;
};

export function validateSeedEnv(
  raw: NodeJS.ProcessEnv = process.env,
): z.infer<typeof seedEnvSchema> {
  const parsed = seedEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const detail = parsed.error.flatten().fieldErrors;
    throw new Error(
      `[env] Seed validation failed:\n${JSON.stringify(detail, null, 2)}`,
    );
  }
  return parsed.data;
}

export function validateServerEnv(
  raw: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  const pick = {
    NODE_ENV: raw.NODE_ENV,
    DATABASE_URL: raw.DATABASE_URL,
    SHADOW_DATABASE_URL: raw.SHADOW_DATABASE_URL,
    JWT_SECRET: raw.JWT_SECRET,
    JWT_ISSUER: raw.JWT_ISSUER,
    JWT_AUDIENCE: raw.JWT_AUDIENCE,
    PORT: raw.PORT,
    CHAT_SECRET: raw.CHAT_SECRET,
    VERA_CORE_UPLOAD_MODE: raw.VERA_CORE_UPLOAD_MODE,
    PUBLIC_BASE_URL: raw.PUBLIC_BASE_URL,
    PUBLIC_API_URL: raw.PUBLIC_API_URL,
    CORS_ORIGIN: raw.CORS_ORIGIN,
    ENABLE_ORIGIN_GUARD: raw.ENABLE_ORIGIN_GUARD,
    VERA_VALIDATE_ENV_STRICT: raw.VERA_VALIDATE_ENV_STRICT,
    VERA_ENFORCE_HTTPS: raw.VERA_ENFORCE_HTTPS,
  };

  const parsed = serverEnvSchema.safeParse(pick);
  if (!parsed.success) {
    const detail = parsed.error.flatten().fieldErrors;
    throw new Error(
      `[env] Server validation failed:\n${JSON.stringify(detail, null, 2)}`,
    );
  }

  const jwt = parsed.data.JWT_SECRET?.trim()
    ? parsed.data.JWT_SECRET.trim()
    : parsed.data.NODE_ENV === 'production'
    ? ''
    : 'dev_secret';

  if (parsed.data.NODE_ENV === 'production' && jwt.length === 0) {
    throw new Error('[env] JWT_SECRET is required when NODE_ENV=production.');
  }

  if (
    parsed.data.NODE_ENV === 'production' &&
    [
      'dev_secret',
      'change-me-in-production',
      'local-dev-only-change-me',
    ].includes(jwt)
  ) {
    throw new Error('[env] JWT_SECRET is too weak for production.');
  }

  if (
    parsed.data.NODE_ENV === 'production' &&
    (!parsed.data.CORS_ORIGIN || parsed.data.CORS_ORIGIN.includes('*'))
  ) {
    throw new Error(
      '[env] CORS_ORIGIN must be explicitly set without wildcards in production.',
    );
  }

  if (
    parsed.data.NODE_ENV === 'production' &&
    parsed.data.ENABLE_ORIGIN_GUARD !== true
  ) {
    throw new Error('[env] ENABLE_ORIGIN_GUARD must be enabled in production.');
  }

  const strictUrls =
    parsed.data.VERA_VALIDATE_ENV_STRICT === true &&
    parsed.data.NODE_ENV === 'production';

  if (strictUrls && parsed.data.PUBLIC_API_URL === undefined) {
    console.warn(
      '[env] PUBLIC_API_URL is unset (strict prod checks recommended for document links).',
    );
  }

  return {
    ...parsed.data,
    effectiveJwtSecret: jwt || 'dev_secret',
  };
}
