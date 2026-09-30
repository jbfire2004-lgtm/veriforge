import type { CSSProperties } from "react";
import {
  veriforgeCssVars,
  veriforgeTokens,
} from "@/src/theme/veriforge-tokens";

/** Apply forged-metal CSS variables from veriforge-tokens.ts */
export function vfTokenVars(
  extra?: CSSProperties,
): CSSProperties {
  return {
    ...(veriforgeCssVars as unknown as CSSProperties),
    ...extra,
  };
}

export { veriforgeTokens, veriforgeCssVars };

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
