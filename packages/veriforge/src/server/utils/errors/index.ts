export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(403, message, "FORBIDDEN", details);
  }
}

export class ModuleAccessDeniedError extends AppError {
  constructor(moduleCode: string, moduleName: string) {
    super(403, `Module not enabled: ${moduleName}`, "MODULE_ACCESS_DENIED", {
      module: moduleCode,
      moduleName,
      upgradeUrl: "/verihub/modules",
      suggestion: `Upgrade your subscription to enable ${moduleName}.`,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class TenantIsolationError extends AppError {
  constructor() {
    super(403, "Cross-tenant access denied", "TENANT_ISOLATION");
  }
}
