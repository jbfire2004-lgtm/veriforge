import type { ProductModuleCode } from "../../../types/modules";
import { ModuleAccessDeniedError } from "../../utils/errors";
import { MODULE_CATALOG } from "../../../config/modules";

export function assertModuleEnabled(
  modulesEnabled: Record<string, boolean> | undefined,
  code: ProductModuleCode,
) {
  if (modulesEnabled?.[code] === true) return;
  const name = MODULE_CATALOG.find((m) => m.code === code)?.name ?? code;
  throw new ModuleAccessDeniedError(code, name);
}
