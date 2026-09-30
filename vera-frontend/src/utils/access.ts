import { api } from "@/src/utils/api";

export function useAccessCheck(workerId: string, siteId: string) {
  return api.access.check.useQuery(
    { workerId, siteId },
    { enabled: !!workerId && !!siteId }
  );
}
