import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supervisorApi } from "../lib/api";

export function useSupervisorRequests(supervisorId: string) {
  return useQuery({
    queryKey: ["supervisor", "requests", supervisorId],
    queryFn: async () => (await supervisorApi.getSupervisorRequests(supervisorId)).data,
    enabled: Boolean(supervisorId),
  });
}

export function useRespondToRequest(supervisorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: "confirmed_on_site" | "not_on_site" }) =>
      (await supervisorApi.respondToRequest(params.id, params.status)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisor", "requests", supervisorId] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}
