import { unknownToErrorMessage } from "./api-error";

export type AsyncOk<T> = { ok: true; value: T };
export type AsyncErr = { ok: false; message: string };

/** Standardize `try/catch` + {@link unknownToErrorMessage} for Core UI state setters. */
export async function catchToMessage<T>(
  fn: () => Promise<T>
): Promise<AsyncOk<T> | AsyncErr> {
  try {
    return { ok: true, value: await fn() };
  } catch (e: unknown) {
    return { ok: false, message: unknownToErrorMessage(e) };
  }
}
