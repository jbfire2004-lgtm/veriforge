import { useQuery } from "@tanstack/react-query";
import { heartbeatApi } from "../lib/api";

export function useHeartbeat(workerId: string) {
  return useQuery({
    queryKey: ["heartbeat", workerId],
    queryFn: async () => (await heartbeatApi.getByWorker(workerId)).data,
    enabled: Boolean(workerId),
    refetchInterval: 10_000,
  });
}
