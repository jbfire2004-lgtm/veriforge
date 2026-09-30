import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerApi } from "../lib/api";
import { Worker } from "../types";

export function useWorkers(filters?: { lifecycleState?: string; companyId?: string }) {
  return useQuery({
    queryKey: ["workers", filters],
    queryFn: async () => (await workerApi.getWorkers(filters)).data,
  });
}

export function useWorkersLive(refetchInterval = 10_000) {
  return useQuery({
    queryKey: ["workers", "live"],
    queryFn: async () => (await workerApi.getWorkers()).data,
    refetchInterval,
  });
}

export function useWorker(workerId: string) {
  return useQuery({
    queryKey: ["worker", workerId],
    queryFn: async () => (await workerApi.getWorkerById(workerId)).data,
    enabled: Boolean(workerId),
  });
}

export function useRegisterHeartbeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workerId: string) => (await workerApi.registerHeartbeat(workerId)).data,
    onSuccess: (worker: Worker) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["worker", worker.id] });
      queryClient.invalidateQueries({ queryKey: ["heartbeat", worker.id] });
    },
  });
}
