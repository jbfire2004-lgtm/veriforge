export declare class GatewayError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(statusCode: number, message: string, code: string, details?: unknown | undefined);
}
export declare class UnauthorizedError extends GatewayError {
    constructor(message?: string, details?: unknown);
}
export declare class ForbiddenError extends GatewayError {
    constructor(message?: string, details?: unknown);
}
export declare class TooManyRequestsError extends GatewayError {
    constructor(message?: string);
}
export declare class BadGatewayError extends GatewayError {
    constructor(message?: string);
}
