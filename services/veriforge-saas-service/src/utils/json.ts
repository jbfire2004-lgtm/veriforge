import { Prisma } from '@prisma/client';

/** Prisma JSON columns reject a plain `Record<string, unknown>`. */
export function asJson(
  value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}
