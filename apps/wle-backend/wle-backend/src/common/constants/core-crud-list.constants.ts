/** Default page size for operational Core list endpoints. */
export const CORE_CRUD_DEFAULT_TAKE = 50;

/** Hard cap for `take` / page size (applied in DTO + service). */
export const CORE_CRUD_MAX_TAKE = 200;

export function clampCoreCrudTake(take?: number): number {
  const raw = take ?? CORE_CRUD_DEFAULT_TAKE;
  return Math.min(Math.max(raw, 1), CORE_CRUD_MAX_TAKE);
}
