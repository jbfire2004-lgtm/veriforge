import { HubWeatherSettings } from "@/components/hub/HubWeatherSettings";
import { WorkspaceSection } from "@/components/theme/workspace";

export const metadata = {
  title: "Hub settings — VERA",
  description: "Personal preferences for Vera Hub — weather alerts and notifications.",
};

export default function HubSettingsPage() {
  return (
    <div className="space-y-8 pb-16">
      <WorkspaceSection
        title="Hub settings"
        description="Manage your personal Vera Hub preferences."
      >
        <div className="max-w-xl">
          <HubWeatherSettings />
        </div>
      </WorkspaceSection>
    </div>
  );
}
