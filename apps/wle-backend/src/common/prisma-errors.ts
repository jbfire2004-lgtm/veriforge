import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** True when Prisma rejected an insert/update for a unique constraint. */
export function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

/**
 * If `err` is a unique violation and `replay` returns a row, return that row
 * (idempotent retry). Otherwise rethrow as ConflictException or the original error.
 */
export async function replayOrConflict<T>(
  err: unknown,
  replay: () => Promise<T | null | undefined>,
  message = 'Duplicate clientSyncId',
): Promise<T> {
  if (!isPrismaUniqueViolation(err)) throw err;
  const existing = await replay();
  if (existing != null) return existing;
  throw new ConflictException(message);
}
