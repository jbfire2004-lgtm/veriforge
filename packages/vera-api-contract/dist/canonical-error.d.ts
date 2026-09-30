/**
 * Canonical API error payload nested under `error` in HTTP JSON responses.
 * Top-level envelope: { success: false, statusCode, error: CanonicalApiError, timestamp }
 */
export type CanonicalApiError = {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
};
/**
 * Normalize Nest `HttpException.getResponse()` (string or object) plus HTTP status
 * into {@link CanonicalApiError}.
 */
export declare function toCanonicalApiError(raw: string | object, statusCode: number): CanonicalApiError;
