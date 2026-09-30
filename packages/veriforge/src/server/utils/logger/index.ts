export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

export const logger = {
  debug(message: string, fields?: LogFields) {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "production") return;
    console.debug("[veriforge]", message, fields ?? {});
  },
  info(message: string, fields?: LogFields) {
    console.info("[veriforge]", message, fields ?? {});
  },
  warn(message: string, fields?: LogFields) {
    console.warn("[veriforge]", message, fields ?? {});
  },
  error(message: string, fields?: LogFields) {
    console.error("[veriforge]", message, fields ?? {});
  },
};
