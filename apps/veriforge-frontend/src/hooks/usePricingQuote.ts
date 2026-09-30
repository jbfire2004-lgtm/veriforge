import { useQuery } from "@tanstack/react-query";
import { pricingApi } from "../lib/api";
import type { BillingCycle, ModuleCode } from "../types/api";

export function usePricingQuote(modules: ModuleCode[], billingCycle: BillingCycle) {
  return useQuery({
    queryKey: ["pricing-quote", modules.slice().sort().join(","), billingCycle],
    queryFn: async () => {
      const { data } = await pricingApi.quote(modules, billingCycle);
      return data;
    },
    enabled: modules.length > 0,
    staleTime: 30_000,
  });
}

/** Fetch both cycles for live comparison in the signup wizard. */
export function useDualPricingQuotes(modules: ModuleCode[]) {
  const monthly = usePricingQuote(modules, "monthly");
  const annual = usePricingQuote(modules, "annual");
  return { monthly, annual };
}
