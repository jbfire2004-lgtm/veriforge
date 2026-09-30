/**
 * VERA Core — shared API client utilities (errors + JSON fetch).
 *
 * Import from `@/lib/core` instead of deep paths like `@/lib/core/http`.
 */

export {
  errorFromApiResponse,
  unknownToErrorMessage,
  type NestErrorBody,
} from "./api-error";

export { fetchJson, fetchArrayBuffer } from "./fetch-json";

export {
  catchToMessage,
  type AsyncOk,
  type AsyncErr,
} from "./async-result";

export { parseOptionalPositiveInt } from "./parse-positive-int";
