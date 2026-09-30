import type { DigitalTwin, TwinDashboardBundle, TwinEventPayload, TwinType } from "@vera/digital-twin";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function hydrateTwins(companyId: number): Promise<DigitalTwin[]> {
  return apiAxiosPost<DigitalTwin[]>("/api/v1/twins/hydrate", null, {
    params: { companyId },
  });
}

export async function fetchTwin(type: TwinType, id: string): Promise<DigitalTwin> {
  return apiAxiosGet<DigitalTwin>(`/api/v1/twins/${type}/${id}`);
}

export async function fetchTwinTimeline(type: TwinType, id: string) {
  return apiAxiosGet(`/api/v1/twins/${type}/${id}/timeline`);
}

export async function fetchTwinDashboard(): Promise<TwinDashboardBundle> {
  return apiAxiosGet<TwinDashboardBundle>("/api/v1/twins/dashboard");
}

export async function applyTwinEvent(event: TwinEventPayload) {
  return apiAxiosPost("/api/v1/twins/events", event);
}
