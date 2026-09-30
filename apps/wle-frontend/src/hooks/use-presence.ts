import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { presenceApi } from "../lib/api";

export function usePresenceScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workerId, code }: { workerId: string; code: string }) =>
      (await presenceApi.scanPresence(workerId, code)).data,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["worker", variables.workerId] });
      queryClient.invalidateQueries({ queryKey: ["presence", "worker", variables.workerId] });
    },
  });
}

export function useWorkerPresence(workerId: string) {
  return useQuery({
    queryKey: ["presence", "worker", workerId],
    queryFn: async () => (await presenceApi.getWorkerPresence(workerId)).data,
    enabled: Boolean(workerId),
  });
}
