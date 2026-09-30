import { WorkspaceSection } from "@/components/theme/workspace";
import { WeatherFieldCard } from "./WeatherFieldCard";
import { DailyBriefingCard } from "./DailyBriefingCard";
import { SafetyCalculatorsCard } from "./SafetyCalculatorsCard";

/** Weather, briefing, and field tools — three matching hub cards. */
export function HubToolkitSection() {
  return (
    <WorkspaceSection
      title="Field toolkit"
      description="Live weather hazards, briefings, and safety calculators for the job site."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <WeatherFieldCard />
        <DailyBriefingCard />
        <SafetyCalculatorsCard />
      </div>
    </WorkspaceSection>
  );
}
