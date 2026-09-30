import { apiGet } from "@/lib/api";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  SupervisorDashboardView,
  type SupervisorDashboardStats,
  type SupervisorRecentLog,
} from "./SupervisorDashboardView";

export default async function SupervisorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/auth/login?callbackUrl=/supervisor");
  }

  let stats: SupervisorDashboardStats | null = null;
  let recent: SupervisorRecentLog[] = [];
  let loadError: string | null = null;

  try {
    const rawStats = await apiGet<SupervisorDashboardStats>("/supervisor/dashboard");
    stats = rawStats;
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Could not load supervisor dashboard statistics.";
  }

  try {
    const rawRecent = await apiGet<SupervisorRecentLog[]>("/verification/logs/recent");
    recent = Array.isArray(rawRecent) ? rawRecent : [];
  } catch {
    if (!loadError) {
      loadError = "Could not load recent verification activity.";
    }
    recent = [];
  }

  return (
    <SupervisorDashboardView stats={stats} recent={recent} loadError={loadError} />
  );
}
