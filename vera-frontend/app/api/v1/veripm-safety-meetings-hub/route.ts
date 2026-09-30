import {
  buildSafetyMeetingsHub,
} from "@/lib/veripm-safety-meetings-hub";
import { cachedJsonResponse } from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-safety-meetings-hub";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "1");
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const existingTopicCount = Number(
    url.searchParams.get("existingTopicCount") ?? "0",
  );

  return cachedJsonResponse(
    NS,
    { projectId, companyId, existingTopicCount },
    () =>
      buildSafetyMeetingsHub({
        projectId,
        companyId,
        existingTopicCount,
      }),
  );
}
