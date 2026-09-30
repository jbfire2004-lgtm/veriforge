export class GatewayError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export class UnauthorizedError extends GatewayError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(401, message, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends GatewayError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, message, 'FORBIDDEN', details);
  }
}

export class TooManyRequestsError extends GatewayError {
  constructor(message = 'Too many requests') {
    super(429, message, 'RATE_LIMITED');
  }
}

export class BadGatewayError extends GatewayError {
  constructor(message = 'Upstream service unavailable') {
    super(502, message, 'BAD_GATEWAY');
  }
}
