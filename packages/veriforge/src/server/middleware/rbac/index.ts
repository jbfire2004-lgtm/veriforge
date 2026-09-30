import { ForbiddenError } from "../../utils/errors";
import { hasAny } from "../../utils/permissions";

export function requirePermission(granted: string[], ...keys: string[]) {
  if (!hasAny(granted, keys)) {
    throw new ForbiddenError(`Missing permission: ${keys.join(" | ")}`);
  }
}
