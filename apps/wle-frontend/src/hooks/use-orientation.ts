import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orientationApi } from "../lib/api";
import { Worker } from "../types";

export function useCompleteOrientation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { workerId: string; date: string }) =>
      (await orientationApi.completeOrientation(params.workerId, params.date)).data,
    onSuccess: (result: { success: boolean; worker: Worker }) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers", "live"] });
      queryClient.invalidateQueries({ queryKey: ["worker", result.worker.id] });
    },
  });
}

export function useExpireOrientation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workerId: string) => (await orientationApi.expireOrientation(workerId)).data,
    onSuccess: (result: { success: boolean; worker: Worker }) => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers", "live"] });
      queryClient.invalidateQueries({ queryKey: ["worker", result.worker.id] });
    },
  });
}
