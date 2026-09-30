/** User-facing message for failed API reachability (browser + Node fetch). */
export function networkReachabilityMessage(error: unknown): string | null {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    if (
      message === "failed to fetch" ||
      message === "fetch failed" ||
      message.includes("networkerror") ||
      message.includes("econnrefused")
    ) {
      return "Could not reach the VERA API. Ensure the backend is running on port 3001.";
    }
  }
  // AbortSignal.timeout / user abort during Nest restarts
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return "The VERA API timed out. Retry in a moment — the backend may be restarting.";
  }
  if (error instanceof Error && /aborted|timeout/i.test(error.message)) {
    return "The VERA API timed out. Retry in a moment — the backend may be restarting.";
  }
  return null;
}

export function apiLoadErrorMessage(
  error: unknown,
  fallback = "Could not load data",
): string {
  return (
    networkReachabilityMessage(error) ??
    (error instanceof Error ? error.message : fallback)
  );
}
