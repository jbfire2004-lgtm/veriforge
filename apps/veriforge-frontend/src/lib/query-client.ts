import { QueryClient } from "@tanstack/react-query";

/**
 * Default cache policy for VeriForge SPA.
 * Pricing overrides to 30s in usePricingQuote; admin lists inherit these defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
    },
  },
});
