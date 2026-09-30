import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rulesApi } from "../lib/api";
import { ExpiryRules } from "../types";

export function useRules() {
  return useQuery({
    queryKey: ["rules"],
    queryFn: async () => (await rulesApi.getRules()).data,
  });
}

export function useUpdateRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ExpiryRules>) => (await rulesApi.updateRules(patch)).data.rules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
}
