export declare const ApiErrorCode: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly CONFLICT: "CONFLICT";
    readonly BAD_REQUEST: "BAD_REQUEST";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly OFFLINE_SYNC_CONFLICT: "OFFLINE_SYNC_CONFLICT";
};
export type ApiErrorCodeValue = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
